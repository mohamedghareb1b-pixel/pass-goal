import { NextRequest, NextResponse } from "next/server";
import { db } from "@/infrastructure/db/client";
import { matches } from "@/infrastructure/db/schema";
import { syncMatches, type MatchesWriteRepository } from "@/application/use-cases/SyncMatches";
import { DrizzleMatchesRepository } from "@/infrastructure/repositories/MatchesRepository";
import { FootballDataApiClient } from "@/infrastructure/sports-api/FootballDataApiClient";

const apiClient = new FootballDataApiClient();
const matchesRepo = new DrizzleMatchesRepository();

const writeRepo: MatchesWriteRepository = {
  findAll: () => matchesRepo.findAll(),
  ensureTeam: (id, name) => matchesRepo.ensureTeam(id, name),
  async upsertFromApi(data) {
    await db
      .insert(matches)
      .values({
        id: data.id,
        homeTeamId: data.homeTeamId,
        awayTeamId: data.awayTeamId,
        kickoffUtc: new Date(data.kickoffUtc),
        venue: data.venue,
        city: data.city,
        status: data.status,
        liveMinute: data.liveMinute ?? null,
        homeScore: data.score?.home ?? null,
        awayScore: data.score?.away ?? null,
        lastPolledAt: new Date(),
      })
      .onConflictDoUpdate({
        target: matches.id,
        set: {
          status: data.status,
          liveMinute: data.liveMinute ?? null,
          homeScore: data.score?.home ?? null,
          awayScore: data.score?.away ?? null,
          lastPolledAt: new Date(),
        },
      });
  },
};

// Protect the cron endpoint with a shared secret (Vercel Cron sends this header).
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await syncMatches(apiClient, writeRepo);
  return NextResponse.json(result);
}
