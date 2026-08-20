/**
 * Maps Football-Data.org's numeric team IDs to our internal team slugs
 * (the `teams.id` primary key, matching `seedTeams.ts`).
 *
 * IMPORTANT: the numeric IDs below are NOT verified against the live API —
 * Football-Data.org's IDs can only be confirmed by calling
 * GET /v4/competitions/PL/teams with a real API key. Before going live,
 * run that call once and correct any ID here that doesn't match.
 */
export const FOOTBALL_DATA_TEAM_ID_MAP: Record<number, string> = {
  57: "arsenal",
  61: "chelsea",
  65: "man-city",
  66: "man-united",
  64: "liverpool",
  73: "tottenham",
  67: "newcastle",
  563: "west-ham",
  397: "brighton",
  354: "crystal-palace",
  351: "nottingham-forest",
  1044: "brentford",
  402: "wolves",
  62: "everton",
  349: "bournemouth",
  340: "fulham",
  346: "burnley",
  356: "sunderland",
  338: "leeds",
  1076: "sheffield-united",
};
