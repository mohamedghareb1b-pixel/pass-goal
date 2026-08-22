import { NextResponse } from "next/server";
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

// Manual trigger for the admin panel — same sync logic as the cron, but
// callable on demand while testing (no CRON_SECRET needed since it's
// already behind /admin's password middleware).
export async function POST() {
  try {
    const result = await syncMatches(apiClient, writeRepo);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Sync failed" }, { status: 500 });
  }
}
