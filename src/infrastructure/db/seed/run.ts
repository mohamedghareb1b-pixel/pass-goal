import { db } from "@/infrastructure/db/client";
import { teams, categories } from "@/infrastructure/db/schema";
import { PREMIER_LEAGUE_TEAMS } from "./teams";

const DEFAULT_CATEGORIES = [
  { id: "results", name: "Results", slug: "results" },
  { id: "analysis", name: "Analysis", slug: "analysis" },
  { id: "transfers", name: "Transfers", slug: "transfers" },
  { id: "derbies", name: "Derbies", slug: "derbies" },
];

async function seed() {
  console.log(`Seeding ${PREMIER_LEAGUE_TEAMS.length} Premier League teams...`);
  for (const team of PREMIER_LEAGUE_TEAMS) {
    await db.insert(teams).values(team).onConflictDoUpdate({ target: teams.id, set: team });
  }

  console.log(`Seeding ${DEFAULT_CATEGORIES.length} default categories...`);
  for (const category of DEFAULT_CATEGORIES) {
    await db.insert(categories).values(category).onConflictDoUpdate({ target: categories.id, set: category });
  }

  console.log("Seed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
