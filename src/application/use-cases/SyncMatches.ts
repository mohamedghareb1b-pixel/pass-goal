import type { Match, MatchStatus } from "@/domain/entities/Match";
import { pollTier } from "@/domain/entities/Match";

export interface SportsApiClient {
  /** Fetches current Premier League fixtures/results from the external provider. */
  fetchPremierLeagueMatches(): Promise<
    Array<{
      id: string;
      homeTeamId: string;
      homeTeamName: string;
      awayTeamId: string;
      awayTeamName: string;
      kickoffUtc: string;
      venue: string;
      city: string;
      status: MatchStatus;
      liveMinute?: number;
      homeScore?: number;
      awayScore?: number;
    }>
  >;
}

export interface MatchesWriteRepository {
  findAll(): Promise<Match[]>;
  ensureTeam(id: string, name: string): Promise<void>;
  upsertFromApi(data: {
    id: string;
    homeTeamId: string;
    awayTeamId: string;
    kickoffUtc: string;
    venue: string;
    city: string;
    status: MatchStatus;
    liveMinute?: number;
    score?: { home: number; away: number };
  }): Promise<void>;
}

/**
 * Runs on a frequent base schedule (e.g. every minute), but only actually
 * re-fetches/updates matches whose poll tier is "fast" (live, or kicking
 * off soon) every time — "slow" tier matches (far-off upcoming, or already
 * finished) are updated less often to avoid hammering the API. See brief
 * section 3.1 for the reasoning.
 */
export async function syncMatches(
  api: SportsApiClient,
  repo: MatchesWriteRepository,
  now = new Date()
): Promise<{ updated: number; skipped: number }> {
  const existing = await repo.findAll();
  const existingById = new Map(existing.map((m) => [m.id, m]));

  const apiMatches = await api.fetchPremierLeagueMatches();

  let updated = 0;
  let skipped = 0;

  for (const apiMatch of apiMatches) {
    const current = existingById.get(apiMatch.id);
    const asMatch: Match = {
      ...apiMatch,
      score:
        apiMatch.homeScore !== undefined && apiMatch.awayScore !== undefined
          ? { home: apiMatch.homeScore, away: apiMatch.awayScore }
          : undefined,
      lastPolledAt: current?.lastPolledAt ?? new Date(0).toISOString(),
    };

    const tier = pollTier(asMatch, now);
    const minutesSinceLastPoll = current
      ? (now.getTime() - new Date(current.lastPolledAt).getTime()) / 60000
      : Infinity;

    // Fast tier: always refresh. Slow tier: only refresh roughly hourly.
    const shouldUpdate = tier === "fast" || minutesSinceLastPoll >= 60 || !current;

    if (!shouldUpdate) {
      skipped++;
      continue;
    }

    // Auto-create the team row if our (best-effort) ID map missed it —
    // this is what stops the foreign key error when Football-Data's
    // numeric IDs don't line up with our manually-seeded team list.
    await repo.ensureTeam(apiMatch.homeTeamId, apiMatch.homeTeamName);
    await repo.ensureTeam(apiMatch.awayTeamId, apiMatch.awayTeamName);

    await repo.upsertFromApi({
      id: apiMatch.id,
      homeTeamId: apiMatch.homeTeamId,
      awayTeamId: apiMatch.awayTeamId,
      kickoffUtc: apiMatch.kickoffUtc,
      venue: apiMatch.venue,
      city: apiMatch.city,
      status: apiMatch.status,
      liveMinute: apiMatch.liveMinute,
      score: asMatch.score,
    });
    updated++;
  }

  return { updated, skipped };
}
