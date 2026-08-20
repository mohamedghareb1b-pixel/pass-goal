import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { DrizzleAuthorsRepository } from "@/infrastructure/repositories/AuthorsRepository";

// Force this route to always run dynamically and hit the DB fresh —
// without this, Next.js can statically cache the GET response at build
// time (when the DB was empty), so newly added rows never show up.
export const dynamic = "force-dynamic";

const repo = new DrizzleAuthorsRepository();

function slugify(name: string): string {
  const slug = name.trim().toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
  return slug || `author-${randomUUID().slice(0, 8)}`;
}

export async function GET() {
  const list = await repo.findAll();
  return NextResponse.json({ authors: list });
}

export async function POST(req: NextRequest) {
  const { id, name, bio, avatarUrl } = await req.json();
  if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });

  await repo.upsert({
    id: id ?? randomUUID(),
    name,
    slug: slugify(name),
    bio: bio ?? "",
    avatarUrl: avatarUrl ?? "",
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  await repo.remove(id);
  return NextResponse.json({ ok: true });
}
