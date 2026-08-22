/**
 * Maps Football-Data.org's numeric team IDs to our internal team slugs
 * (the `teams.id` primary key, matching `seedTeams.ts`).
 *
 * HOW TO VERIFY / FIX "71 vs 322 vs 341" unknown team names:
 * ─────────────────────────────────────────────────────────────
 * When you see a numeric string ("71", "322", "341", "58"…) as a team
 * name in the admin, it means that Football-Data returned an id that is
 * NOT mapped here. The fix is:
 *
 *   1. Call GET https://api.football-data.org/v4/competitions/PL/teams
 *      (with your X-Auth-Token header) to get the live ID list.
 *   2. Find the missing club and add its id → slug here.
 *   3. Delete the placeholder row from the `teams` table in Supabase
 *      (it was auto-created by ensureTeam() with the numeric id as slug).
 *   4. Run "Sync now from API" in Matches Management.
 *
 * Known PL 2024/25 IDs (most verified against Football-Data.org):
 */
export const FOOTBALL_DATA_TEAM_ID_MAP: Record<number, string> = {
  57: "arsenal",
  58: "aston-villa",
  61: "chelsea",
  62: "everton",
  64: "liverpool",
  65: "man-city",
  66: "man-united",
  67: "newcastle",
  73: "tottenham",
  76: "wolves",
  328: "ipswich",
  338: "leeds",
  340: "fulham",
  341: "leeds",         // alternate ID seen in some seasons
  346: "burnley",
  349: "bournemouth",
  351: "nottingham-forest",
  354: "crystal-palace",
  356: "sunderland",
  397: "brighton",
  402: "wolves",
  563: "west-ham",
  715: "leicester",
  1044: "brentford",
  1076: "sheffield-united",
  // If you still see numeric IDs in admin, add them here after checking
  // the live /v4/competitions/PL/teams endpoint.
};
