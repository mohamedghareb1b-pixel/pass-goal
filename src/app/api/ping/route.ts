// Lightweight keep-alive endpoint — Vercel cron hits this every 5 minutes
// to keep the serverless function warm, eliminating the cold-start delay
// on login and admin actions.
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ ok: true, ts: Date.now() });
}
