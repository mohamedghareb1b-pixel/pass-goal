import { NextResponse } from "next/server";
import { DrizzleArticlesRepository } from "@/infrastructure/repositories/ArticlesRepository";

// Force this route to always run dynamically and hit the DB fresh —
// without this, Next.js can statically cache the GET response at build
// time (when the DB was empty), so newly added rows never show up.
export const dynamic = "force-dynamic";

export async function GET() {
  const repo = new DrizzleArticlesRepository();
  const all = await repo.findAll();
  const published = all
    .filter((a) => a.publishedAt)
    .sort((a, b) => new Date(b.publishedAt!).getTime() - new Date(a.publishedAt!).getTime());
  return NextResponse.json({ articles: published });
}
