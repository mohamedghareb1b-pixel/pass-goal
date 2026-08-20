import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/db/client";
import { affiliateSettings } from "@/infrastructure/db/schema";

// Force this route to always run dynamically and hit the DB fresh —
// without this, Next.js can statically cache the GET response at build
// time (when the DB was empty), so newly added rows never show up.
export const dynamic = "force-dynamic";

// Impact tracking code (brief section 8): admin pastes in the code the
// partner gives us, no automation involved.
export async function GET() {
  const rows = await db.select().from(affiliateSettings).where(eq(affiliateSettings.id, "impact")).limit(1);
  return NextResponse.json({ trackingCode: rows[0]?.trackingCode ?? "" });
}

export async function POST(req: NextRequest) {
  const { trackingCode } = await req.json();
  await db
    .insert(affiliateSettings)
    .values({ id: "impact", trackingCode, updatedAt: new Date() })
    .onConflictDoUpdate({ target: affiliateSettings.id, set: { trackingCode, updatedAt: new Date() } });
  return NextResponse.json({ ok: true });
}
