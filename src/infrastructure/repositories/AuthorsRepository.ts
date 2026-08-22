import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/db/client";
import { authors } from "@/infrastructure/db/schema";

export interface Author {
  id: string;
  name: string;
  slug: string;
  bio: string;
  avatarUrl: string;
}

export class DrizzleAuthorsRepository {
  async findAll(): Promise<Author[]> {
    return db.select().from(authors);
  }

  async findBySlug(slug: string): Promise<Author | null> {
    const rows = await db.select().from(authors).where(eq(authors.slug, slug)).limit(1);
    return rows[0] ?? null;
  }

  async upsert(author: Author): Promise<void> {
    await db.insert(authors).values(author).onConflictDoUpdate({ target: authors.id, set: author });
  }

  async remove(id: string): Promise<void> {
    await db.delete(authors).where(eq(authors.id, id));
  }
}
