// Server Component — fetches categories, matches, and authors directly
// from the DB at render time, so there's no client-side fetch that can
// fail silently or return stale Next.js cached data.
import { db } from "@/infrastructure/db/client";
import { categories, matches } from "@/infrastructure/db/schema";
import { DrizzleAuthorsRepository } from "@/infrastructure/repositories/AuthorsRepository";
import ArticleForm from "@/components/admin/ArticleForm";

export const dynamic = "force-dynamic";

export default async function NewArticlePage() {
  const [categoryRows, matchRows, authorRows] = await Promise.all([
    db.select().from(categories),
    db
      .select({
        id: matches.id,
        homeTeamId: matches.homeTeamId,
        awayTeamId: matches.awayTeamId,
      })
      .from(matches),
    new DrizzleAuthorsRepository().findAll(),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl mb-6">New article</h1>
      <ArticleForm
        categories={categoryRows}
        matches={matchRows}
        authors={authorRows.map((a) => ({ id: a.id, name: a.name }))}
      />
    </div>
  );
}
