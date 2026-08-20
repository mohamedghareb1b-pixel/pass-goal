import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// Reused across hot reloads in dev to avoid exhausting connections.
const globalForDb = globalThis as unknown as { queryClient?: ReturnType<typeof postgres> };

// `prepare: false` is required when DATABASE_URL points at Supabase's
// connection pooler (PgBouncer, port 6543, "Transaction" mode) — that mode
// doesn't support session-level prepared statements, and postgres.js uses
// them by default. Without this, queries can hang or fail unpredictably in
// serverless (Vercel) even though everything works fine locally.
// `connect_timeout` makes a bad/unreachable connection string fail fast
// with a clear error instead of hanging the request indefinitely.
const queryClient =
  globalForDb.queryClient ??
  postgres(connectionString, { max: 1, prepare: false, connect_timeout: 10, idle_timeout: 20 });
if (process.env.NODE_ENV !== "production") globalForDb.queryClient = queryClient;

export const db = drizzle(queryClient, { schema });
