import { NextRequest, NextResponse } from "next/server";
import { db } from "@/infrastructure/db/client";
import { matches, teams } from "@/infrastructure/db/schema";
import { eq } from "drizzle-orm";

// Force this route to always run dynamically and hit the DB fresh —
// without this, Next.js can statically cache the GET response at build
// time (when the DB was empty), so newly added rows never show up.
export const dynamic = "force-dynamic";

// GET: list all matches for the "Matches Management" admin screen.
export async function GET() {
  const rows = await db
    .select({
      id: matches.id,
      homeTeamId: matches.homeTeamId,
      awayTeamId: matches.awayTeamId,
      kickoffUtc: matches.kickoffUtc,
      venue: matches.venue,
      city: matches.city,
      status: matches.status,
      liveMinute: matches.liveMinute,
      homeScore: matches.homeScore,
      awayScore: matches.awayScore,
      ticketUrl: matches.ticketUrl,
      linkedArticleSlug: matches.linkedArticleSlug,
    })
    .from(matches)
    .orderBy(matches.kickoffUtc);

  const teamRows = await db.select().from(teams);

  return NextResponse.json({ matches: rows, teams: teamRows });
}

// PATCH: admin manually sets the Ticket Link or Article Slug on a match.
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { matchId, ticketUrl, linkedArticleSlug } = body;

  if (!matchId) {
    return NextResponse.json({ error: "matchId is required" }, { status: 400 });
  }

  const updateData: Record<string, any> = {};

  if ("ticketUrl" in body) {
    updateData.ticketUrl = ticketUrl || null;
  }
  if ("linkedArticleSlug" in body) {
    updateData.linkedArticleSlug = linkedArticleSlug || null;
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  await db.update(matches).set(updateData).where(eq(matches.id, matchId));

  return NextResponse.json({ ok: true });
}
