const BASE_URL = process.env.SPORTS_API_BASE_URL || "https://api.football-data.org/v4";
const PREMIER_LEAGUE_CODE = "PL";

export interface FootballDataTeam {
  id: number;
  name: string;
  shortName: string;
  crest: string; // URL to a PNG/SVG crest hosted by Football-Data
  clubColors?: string | null; // e.g. "Red / White"
}

/**
 * Fetches the official crest URL + club colors for all 20 Premier League
 * teams in one call. Used to auto-fill teams.crestUrl instead of relying
 * on manually uploaded images.
 */
export async function fetchPremierLeagueTeams(apiKey = process.env.SPORTS_API_KEY!): Promise<FootballDataTeam[]> {
  const res = await fetch(`${BASE_URL}/competitions/${PREMIER_LEAGUE_CODE}/teams`, {
    headers: { "X-Auth-Token": apiKey },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Football-Data teams API error: ${res.status} ${res.statusText}`);
  }

  const data: { teams: FootballDataTeam[] } = await res.json();
  return data.teams;
}

/** First hex-ish color guess from Football-Data's free-text "clubColors" field. */
const COLOR_NAME_MAP: Record<string, string> = {
  red: "#D9364A",
  blue: "#0057B8",
  white: "#F7F5F2",
  black: "#1A1620",
  yellow: "#FDB913",
  green: "#2E8B57",
  claret: "#7A263A",
  maroon: "#7A263A",
  sky: "#6CABDD",
  navy: "#132257",
  gold: "#C9A24B",
};

export function guessPrimaryColor(clubColors?: string | null): string | null {
  if (!clubColors) return null;
  const first = clubColors.split(/[\/,]/)[0]?.trim().toLowerCase();
  return first ? COLOR_NAME_MAP[first] ?? null : null;
}
