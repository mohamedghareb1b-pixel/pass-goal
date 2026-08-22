import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { DrizzleArticlesRepository } from "@/infrastructure/repositories/ArticlesRepository";
import { db } from "@/infrastructure/db/client";
import { categories, matches } from "@/infrastructure/db/schema";

// Force this route to always run dynamically and hit the DB fresh —
// without this, Next.js can statically cache the GET response at build
// time (when the DB was empty), so newly added rows never show up.
export const dynamic = "force-dynamic";

const repo = new DrizzleArticlesRepository();

export async function GET() {
  const [list, categoryRows, matchRows] = await Promise.all([
    repo.findAll(),
    db.select().from(categories),
    db.select({ id: matches.id, homeTeamId: matches.homeTeamId, awayTeamId: matches.awayTeamId }).from(matches),
  ]);
  return NextResponse.json({ articles: list, categories: categoryRows, matches: matchRows });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const required = ["title", "slug", "categoryId", "metaTitle", "metaDescription", "quickAnswer", "bodyPartOne"];
  for (const field of required) {
    if (!body[field]) {
      return NextResponse.json({ error: `${field} is required` }, { status: 400 });
    }
  }

  await repo.upsert({
    id: body.id ?? randomUUID(),
    slug: body.slug,
    title: body.title,
    authorName: body.authorName || "Shindy",
    authorAvatarUrl: body.authorAvatarUrl || "/images/shindy-avatar.webp",
    authorId: body.authorId ?? null,
    categoryId: body.categoryId,
    tags: body.tags ?? [],
    metaTitle: body.metaTitle,
    metaDescription: body.metaDescription,
    quickAnswer: body.quickAnswer,
    imageOneUrl: body.imageOneUrl ?? "",
    imageTwoUrl: body.imageTwoUrl ?? "",
    bodyPartOne: body.bodyPartOne,
    bodyPartTwo: body.bodyPartTwo ?? "",
    faq: body.faq ?? [],
    linkedMatchId: body.linkedMatchId ?? null,
    publishedAt: body.publishedAt ?? null,
  });

  return NextResponse.json({ ok: true, slug: body.slug });
}
