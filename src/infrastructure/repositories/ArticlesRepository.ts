import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/db/client";
import { articles, matches } from "@/infrastructure/db/schema";
import type { Article } from "@/domain/entities/Article";

function safeIso(d: Date | null | undefined): string | null {
  if (!d) return null;
  const time = d instanceof Date ? d.getTime() : new Date(d).getTime();
  return Number.isNaN(time) ? null : new Date(time).toISOString();
}

function toDomain(row: typeof articles.$inferSelect): Article {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    authorName: row.authorName,
    authorAvatarUrl: row.authorAvatarUrl,
    authorId: row.authorId,
    categoryId: row.categoryId,
    tags: row.tags,
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
    quickAnswer: row.quickAnswer,
    imageOneUrl: row.imageOneUrl,
    imageTwoUrl: row.imageTwoUrl,
    bodyPartOne: row.bodyPartOne,
    bodyPartTwo: row.bodyPartTwo,
    faq: row.faq,
    linkedMatchId: row.linkedMatchId,
    publishedAt: safeIso(row.publishedAt),
    createdAt: safeIso(row.createdAt) ?? new Date(0).toISOString(),
    updatedAt: safeIso(row.updatedAt) ?? new Date(0).toISOString(),
  };
}

export class DrizzleArticlesRepository {
  async findAll(): Promise<Article[]> {
    const rows = await db.select().from(articles).orderBy(articles.createdAt);
    return rows.map(toDomain);
  }

  async findBySlug(slug: string): Promise<Article | null> {
    const rows = await db.select().from(articles).where(eq(articles.slug, slug)).limit(1);
    return rows[0] ? toDomain(rows[0]) : null;
  }

  async upsert(data: Omit<Article, "createdAt" | "updatedAt">): Promise<void> {
    const now = new Date();
    const publishedAt =
      data.publishedAt && !Number.isNaN(new Date(data.publishedAt).getTime())
        ? new Date(data.publishedAt)
        : null;

    await db
      .insert(articles)
      .values({ ...data, publishedAt, createdAt: now, updatedAt: now })
      .onConflictDoUpdate({
        target: articles.id,
        set: { ...data, publishedAt, updatedAt: now },
      });

    // Keep the match <-> article link in sync in both directions.
    if (data.linkedMatchId) {
      await db.update(matches).set({ linkedArticleSlug: data.slug }).where(eq(matches.id, data.linkedMatchId));
    }
  }
}
