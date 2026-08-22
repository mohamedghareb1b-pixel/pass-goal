import { NextRequest, NextResponse } from "next/server";
import { db } from "@/infrastructure/db/client";
import { newsletterSubscribers } from "@/infrastructure/db/schema";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  await db
    .insert(newsletterSubscribers)
    .values({ id: randomUUID(), email })
    .onConflictDoNothing();

  return NextResponse.json({ ok: true });
}
