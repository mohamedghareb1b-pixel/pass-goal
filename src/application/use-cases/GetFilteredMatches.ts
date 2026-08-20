import type { Match } from "@/domain/entities/Match";
import type { Team } from "@/domain/entities/Team";

export interface MatchesRepository {
  findByDateRange(startIso: string, endIso: string): Promise<Match[]>;
  findByDate(dateIso: string): Promise<Match[]>;
  findByTeam(teamId: string): Promise<Match[]>;
}

export interface TeamsRepository {
  findAll(): Promise<Team[]>;
  findByNameQuery(query: string): Promise<Team | null>;
}

export type MatchFilter =
  | { type: "none" } // default: yesterday + today + tomorrow
  | { type: "date"; date: Date }
  | { type: "team"; teamId: string };

const DATE_PATTERNS = [
  /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/, // 16/8/2026 or 16-8-2026
  /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/, // 2026-08-16
];

/**
 * Parses the single smart search box: accepts a date in a few common
 * formats, otherwise treats the input as a team-name query.
 */
export function parseSearchInput(raw: string): { kind: "date"; date: Date } | { kind: "team"; query: string } {
  const trimmed = raw.trim();

  for (const pattern of DATE_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match) {
      const [, a, b, c] = match;
      // DD/MM/YYYY vs YYYY-MM-DD — disambiguate by which group is 4 digits
      const isIsoFirst = a.length === 4;
      const year = Number(isIsoFirst ? a : c);
      const month = Number(isIsoFirst ? b : b);
      const day = Number(isIsoFirst ? c : a);
      const date = new Date(Date.UTC(year, month - 1, day));
      if (!Number.isNaN(date.getTime())) {
        return { kind: "date", date };
      }
    }
  }

  return { kind: "team", query: trimmed };
}

function startOfDayUtc(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export async function getFilteredMatches(
  filter: MatchFilter,
  matchesRepo: MatchesRepository,
  teamsRepo: TeamsRepository,
  now = new Date()
): Promise<Match[]> {
  switch (filter.type) {
    case "date": {
      return matchesRepo.findByDate(startOfDayUtc(filter.date).toISOString());
    }
    case "team": {
      return matchesRepo.findByTeam(filter.teamId);
    }
    case "none":
    default: {
      // Default view: yesterday + today + tomorrow, in that date order
      const today = startOfDayUtc(now);
      const yesterday = new Date(today);
      yesterday.setUTCDate(today.getUTCDate() - 1);
      const tomorrowEnd = new Date(today);
      tomorrowEnd.setUTCDate(today.getUTCDate() + 2); // exclusive upper bound
      return matchesRepo.findByDateRange(yesterday.toISOString(), tomorrowEnd.toISOString());
    }
  }
}
