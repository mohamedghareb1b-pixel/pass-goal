import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/db/client";
import { categories } from "@/infrastructure/db/schema";

// Force this route to always run dynamically and hit the DB fresh —
// without this, Next.js can statically cache the GET response at build
// time (when the DB was empty), so newly added rows never show up.
export const dynamic = "force-dynamic";

function slugify(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
  // Arabic (or any non-Latin) names strip down to an empty string here,
  // which was silently colliding across categories via onConflictDoNothing.
  // Fall back to a short random id and keep the original name as-is.
  return slug || `cat-${randomUUID().slice(0, 8)}`;
}

export async function GET() {
  const rows = await db.select().from(categories);
  return NextResponse.json({ categories: rows });
}

// Admin creates categories manually (e.g. "Before Match", "Results") — no
// fixed preset list, so the admin controls the taxonomy from here.
export async function POST(req: NextRequest) {
  const { name } = await req.json();
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const slug = slugify(name);
  await db.insert(categories).values({ id: slug, name, slug }).onConflictDoNothing();
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  await db.delete(categories).where(eq(categories.id, id));
  return NextResponse.json({ ok: true });
}
