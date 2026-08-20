export type MatchStatus = "upcoming" | "live" | "finished";

export interface Score {
  home: number;
  away: number;
}

/**
 * Core Match entity — Premier League only.
 * Fields sourced from the sports API: teams, kickoff, venue, status, score.
 * `ticketUrl` is the ONE field that is manually entered by an admin — never
 * pulled from the API.
 */
export interface Match {
  id: string; // matchId from the sports API
  homeTeamId: string;
  awayTeamId: string;
  kickoffUtc: string; // ISO 8601, always converted to UK time at render time
  venue: string;
  city: string;
  status: MatchStatus;
  liveMinute?: number;
  score?: Score;
  ticketUrl?: string | null; // manual admin entry, TicketNetwork priority
  linkedArticleSlug?: string | null;
  lastPolledAt: string;
}

/**
 * Ticket link visibility rule (from the project brief):
 * - upcoming -> ticket link shown if one has been entered
 * - live     -> ticket link ALWAYS hidden, regardless of admin entry
 * - finished -> ticket link ALWAYS hidden, final score is pinned instead
 */
export function isTicketLinkVisible(match: Match): boolean {
  return match.status === "upcoming" && Boolean(match.ticketUrl);
}

/**
 * Poll-frequency tier for the cron job (see brief section 3.1):
 * matches close to kickoff or already live/unconfirmed-finished poll faster
 * than far-off upcoming matches.
 */
export function pollTier(match: Match, now = new Date()): "fast" | "slow" {
  if (match.status === "live") return "fast";
  if (match.status === "finished") return "slow";
  const kickoff = new Date(match.kickoffUtc).getTime();
  const minutesToKickoff = (kickoff - now.getTime()) / 60000;
  return minutesToKickoff <= 180 ? "fast" : "slow";
}
