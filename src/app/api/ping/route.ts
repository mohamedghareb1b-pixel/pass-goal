// Keep-alive endpoint — Vercel cron hits this every 5 minutes.
// Runs a real DB query (not just a pong) so the connection pool
// stays healthy and Supabase doesn't drop idle connections.
import { db } from "@/infrastructure/db/client";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`SELECT 1`);
    return Response.json({ ok: true, ts: Date.now() });
  } catch (err: any) {
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  }
}