import type { SportsApiClient } from "@/application/use-cases/SyncMatches";
import type { MatchStatus } from "@/domain/entities/Match";
import { FOOTBALL_DATA_TEAM_ID_MAP } from "./teamIdMap";
import { STADIUM_BY_TEAM } from "./stadiums";

const BASE_URL = process.env.SPORTS_API_BASE_URL || "https://api.football-data.org/v4";
const PREMIER_LEAGUE_CODE = "PL";

// Football-Data.org statuses -> our domain's three-state model.
function mapStatus(apiStatus: string): MatchStatus {
  switch (apiStatus) {
    case "IN_PLAY":
    case "PAUSED":
      return "live";
    case "FINISHED":
      return "finished";
    default:
      // SCHEDULED, TIMED, POSTPONED, SUSPENDED, CANCELLED -> treat as upcoming
      return "upcoming";
  }
}

interface FootballDataMatch {
  id: number;
  utcDate: string;
  status: string;
  minute?: number | null;
  homeTeam: { id: number; name: string };
  awayTeam: { id: number; name: string };
  venue?: string | null;
  score: {
    fullTime: { home: number | null; away: number | null };
  };
}

export class FootballDataApiClient implements SportsApiClient {
  private apiKey: string;

  constructor(apiKey = process.env.SPORTS_API_KEY!) {
    this.apiKey = apiKey;
  }

  async fetchPremierLeagueMatches() {
    // Fetching the whole season (380 matches) on every sync is what was
    // making this slow — narrow to a relevant window: a few days back
    // (to catch just-finished matches) through two weeks ahead.
    const now = new Date();
    const dateFrom = new Date(now);
    dateFrom.setUTCDate(now.getUTCDate() - 3);
    const dateTo = new Date(now);
    dateTo.setUTCDate(now.getUTCDate() + 30);

    const params = new URLSearchParams({
      dateFrom: dateFrom.toISOString().slice(0, 10),
      dateTo: dateTo.toISOString().slice(0, 10),
    });

    const res = await fetch(`${BASE_URL}/competitions/${PREMIER_LEAGUE_CODE}/matches?${params}`, {
      headers: { "X-Auth-Token": this.apiKey },
      // Sports data changes fast — never serve a stale cached response.
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Football-Data API error: ${res.status} ${res.statusText}`);
    }

    const data: { matches: FootballDataMatch[] } = await res.json();

    return data.matches.map((m) => {
      const homeTeamId = FOOTBALL_DATA_TEAM_ID_MAP[m.homeTeam.id] ?? String(m.homeTeam.id);
      const awayTeamId = FOOTBALL_DATA_TEAM_ID_MAP[m.awayTeam.id] ?? String(m.awayTeam.id);
      const stadium = STADIUM_BY_TEAM[homeTeamId];

      return {
        id: String(m.id),
        homeTeamId,
        homeTeamName: m.homeTeam.name,
        awayTeamId,
        awayTeamName: m.awayTeam.name,
        kickoffUtc: m.utcDate,
        venue: stadium?.venue ?? m.venue ?? "TBC",
        city: stadium?.city ?? "",
        status: mapStatus(m.status),
        liveMinute: m.minute ?? undefined,
        homeScore: m.score.fullTime.home ?? undefined,
        awayScore: m.score.fullTime.away ?? undefined,
      };
    });
  }
}
