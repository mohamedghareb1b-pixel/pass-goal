import { NextRequest, NextResponse } from "next/server";
import { DrizzleMatchesRepository, DrizzleTeamsRepository } from "@/infrastructure/repositories/MatchesRepository";
import { getFilteredMatches, parseSearchInput, type MatchFilter } from "@/application/use-cases/GetFilteredMatches";
import type { Match } from "@/domain/entities/Match";

// Force this route to always run dynamically and hit the DB fresh —
// without this, Next.js can statically cache the GET response at build
// time (when the DB was empty), so newly added rows never show up.
export const dynamic = "force-dynamic";

const matchesRepo = new DrizzleMatchesRepository();
const teamsRepo = new DrizzleTeamsRepository();

// Public endpoint backing the /fixtures page — resolves the smart search
// box (date vs team name) or a quick pill into the right repository call.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("q");
  const pill = searchParams.get("pill"); // yesterday | today | tomorrow | null

  let matches: Match[];

  if (search) {
    const parsed = parseSearchInput(search);
    if (parsed.kind === "date") {
      matches = await getFilteredMatches({ type: "date", date: parsed.date }, matchesRepo, teamsRepo);
    } else {
      const team = await teamsRepo.findByNameQuery(parsed.query);
      // Search by name across ALL team rows sharing that name, not just
      // the one ID findByNameQuery happened to return first — guards
      // against a club having more than one row (see findByTeamName).
      matches = team ? await matchesRepo.findByTeamName(team.name) : [];
    }
  } else if (pill && pill !== "null") {
    const today = new Date();
    const target = new Date(today);
    if (pill === "yesterday") target.setUTCDate(today.getUTCDate() - 1);
    if (pill === "tomorrow") target.setUTCDate(today.getUTCDate() + 1);
    matches = await getFilteredMatches({ type: "date", date: target }, matchesRepo, teamsRepo);
  } else {
    matches = await getFilteredMatches({ type: "none" }, matchesRepo, teamsRepo);
  }

  const teams = await teamsRepo.findAll();

  return NextResponse.json({ matches, teams });
}
