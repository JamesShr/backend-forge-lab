import { Pool, PoolClient } from "pg";
import { withPostgresClient } from "../../../../shared/postgres/client";

export const databaseUrl =
  process.env.DATABASE_URL ?? "postgres://lab:lab@localhost:55437/backend_forge_lab";

export function createPool(options: {
  max: number;
  connectionTimeoutMillis?: number;
  idleTimeoutMillis?: number;
}): Pool {
  return new Pool({
    connectionString: databaseUrl,
    max: options.max,
    connectionTimeoutMillis: options.connectionTimeoutMillis ?? 5_000,
    idleTimeoutMillis: options.idleTimeoutMillis ?? 10_000,
  });
}

export async function setupSchema(): Promise<void> {
  await withPostgresClient(databaseUrl, async (client) => {
    await client.query(`
      CREATE TABLE IF NOT EXISTS work_log (
        id           SERIAL PRIMARY KEY,
        worker_id    TEXT        NOT NULL,
        hold_ms      INTEGER     NOT NULL,
        completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
  });
}

export async function resetData(): Promise<void> {
  await withPostgresClient(databaseUrl, async (client) => {
    await client.query("TRUNCATE work_log RESTART IDENTITY;");
  });
}

export interface WorkResult {
  workerId: string;
  status: "success" | "timeout" | "error";
  acquireMs: number;
  workMs: number;
  totalMs: number;
  error?: string;
}

export async function doWork(
  pool: Pool,
  workerId: string,
  holdMs: number,
): Promise<WorkResult> {
  const t0 = Date.now();
  let client: PoolClient | undefined;

  try {
    client = await pool.connect();
    const t1 = Date.now();

    await client.query("SELECT pg_sleep($1)", [holdMs / 1000]);
    await client.query(
      "INSERT INTO work_log (worker_id, hold_ms) VALUES ($1, $2)",
      [workerId, holdMs],
    );

    const t2 = Date.now();
    return {
      workerId,
      status: "success",
      acquireMs: t1 - t0,
      workMs: t2 - t1,
      totalMs: t2 - t0,
    };
  } catch (err) {
    const t2 = Date.now();
    const message = err instanceof Error ? err.message : String(err);
    const isTimeout = message.toLowerCase().includes("timeout");
    return {
      workerId,
      status: isTimeout ? "timeout" : "error",
      acquireMs: t2 - t0,
      workMs: 0,
      totalMs: t2 - t0,
      error: message,
    };
  } finally {
    client?.release();
  }
}

export function printSummary(results: WorkResult[]): void {
  const success = results.filter((r) => r.status === "success");
  const timeout = results.filter((r) => r.status === "timeout");
  const errors  = results.filter((r) => r.status === "error");

  const sorted = success.map((r) => r.acquireMs).sort((a, b) => a - b);
  const totalSorted = success.map((r) => r.totalMs).sort((a, b) => a - b);
  const p = (arr: number[], pct: number) => arr[Math.floor(arr.length * pct)] ?? 0;

  console.log(`  Success  : ${success.length}`);
  console.log(`  Timeout  : ${timeout.length}`);
  console.log(`  Error    : ${errors.length}`);
  if (success.length > 0) {
    console.log(`  Acquire  : p50=${p(sorted, 0.5)}ms  p99=${p(sorted, 0.99)}ms`);
    console.log(`  Total    : p50=${p(totalSorted, 0.5)}ms  p99=${p(totalSorted, 0.99)}ms`);
  }
}
