import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/db/client";
import { teams } from "@/infrastructure/db/schema";
import { fetchPremierLeagueTeams, guessPrimaryColor } from "@/infrastructure/sports-api/fetchPremierLeagueTeams";
import { FOOTBALL_DATA_TEAM_ID_MAP } from "@/infrastructure/sports-api/teamIdMap";
import { compressAndStoreImage } from "@/application/use-cases/CompressAndStoreImage";
import { SupabaseImageStorage } from "@/infrastructure/storage/SupabaseImageStorage";

const storage = new SupabaseImageStorage();

/**
 * One-time/occasional sync: pulls the official crest for each of the 20
 * clubs from Football-Data, downloads it, compresses it to WebP (same
 * mandatory pipeline as admin-uploaded images — brief section 12), and
 * updates teams.crestUrl. Also fills in primaryColor when Football-Data's
 * clubColors text gives us a usable guess.
 */
export async function POST() {
  try {
    const apiTeams = await fetchPremierLeagueTeams();
    let updated = 0;
    const failures: string[] = [];

    for (const apiTeam of apiTeams) {
      const ourId = FOOTBALL_DATA_TEAM_ID_MAP[apiTeam.id];
      if (!ourId) {
        failures.push(`No local team mapped for "${apiTeam.name}" (API id ${apiTeam.id})`);
        continue;
      }

      try {
        const crestRes = await fetch(apiTeam.crest);
        if (!crestRes.ok) throw new Error(`crest fetch failed: ${crestRes.status}`);
        const buffer = Buffer.from(await crestRes.arrayBuffer());

        const { url } = await compressAndStoreImage(buffer, `crests/${ourId}`, storage, {
          maxWidth: 128,
          quality: 90,
        });

        const color = guessPrimaryColor(apiTeam.clubColors);

        await db
          .update(teams)
          .set({ crestUrl: url, ...(color ? { primaryColor: color } : {}) })
          .where(eq(teams.id, ourId));

        updated++;
      } catch (err: any) {
        failures.push(`${apiTeam.name}: ${err.message}`);
      }
    }

    return NextResponse.json({ updated, failures });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Crest sync failed" }, { status: 500 });
  }
}
