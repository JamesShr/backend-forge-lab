import { createPostgresClient, withPostgresClient } from "../../../../shared/postgres/client";
import { sleep } from "../../../../shared/postgres/runtime";

export interface Order {
  id: number;
  user_id: string;
  status: "pending" | "processing" | "completed" | "cancelled";
  amount: number;
  created_at: Date;
}

export interface ExplainRow {
  "QUERY PLAN": string;
}

export interface IndexInfo {
  indexname: string;
  indexdef: string;
}

export const databaseUrl =
  process.env.DATABASE_URL ?? "postgres://lab:lab@localhost:55436/backend_forge_lab";

export async function withClient<T>(callback: (client: import("pg").Client) => Promise<T>): Promise<T> {
  return withPostgresClient(databaseUrl, callback);
}

export async function setupSchema(): Promise<void> {
  await withClient(async (client) => {
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id         SERIAL PRIMARY KEY,
        user_id    TEXT        NOT NULL,
        status     TEXT        NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
        amount     INTEGER     NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
  });
}

export async function dropAllIndexes(): Promise<void> {
  await withClient(async (client) => {
    // Drop non-primary indexes on orders table
    const result = await client.query<{ indexname: string }>(`
      SELECT indexname
      FROM pg_indexes
      WHERE tablename = 'orders'
        AND indexname != 'orders_pkey';
    `);

    for (const row of result.rows) {
      await client.query(`DROP INDEX IF EXISTS ${row.indexname};`);
    }
  });
}

export async function seedOrders(): Promise<void> {
  const TOTAL = 100_000;
  const BATCH = 5_000;

  await withClient(async (client) => {
    await client.query("TRUNCATE orders RESTART IDENTITY;");

    // Status distribution: completed 60%, pending 25%, processing 10%, cancelled 5%
    const statuses: Array<{ status: string; weight: number }> = [
      { status: "completed",  weight: 60 },
      { status: "pending",    weight: 25 },
      { status: "processing", weight: 10 },
      { status: "cancelled",  weight:  5 },
    ];

    function pickStatus(): string {
      const roll = Math.random() * 100;
      let cumulative = 0;
      for (const s of statuses) {
        cumulative += s.weight;
        if (roll < cumulative) return s.status;
      }
      return "completed";
    }

    let inserted = 0;
    while (inserted < TOTAL) {
      const batchSize = Math.min(BATCH, TOTAL - inserted);
      const values: string[] = [];
      const params: unknown[] = [];
      let p = 1;

      for (let i = 0; i < batchSize; i++) {
        const userId = `user-${String(Math.floor(Math.random() * 10_000) + 1).padStart(5, "0")}`;
        const status = pickStatus();
        const amount = Math.floor(Math.random() * 10_000) + 100;
        const daysAgo = Math.floor(Math.random() * 365);

        values.push(`($${p++}, $${p++}, $${p++}, now() - interval '${daysAgo} days')`);
        params.push(userId, status, amount);
      }

      await client.query(
        `INSERT INTO orders (user_id, status, amount, created_at) VALUES ${values.join(", ")}`,
        params,
      );

      inserted += batchSize;
      process.stdout.write(`\r  Seeding orders: ${inserted.toLocaleString()} / ${TOTAL.toLocaleString()}`);
    }

    console.log("\n  Running ANALYZE to update planner statistics...");
    await client.query("ANALYZE orders;");
  });
}

export async function explainAnalyze(sql: string, params: unknown[] = []): Promise<string[]> {
  const client = await createPostgresClient(databaseUrl);
  try {
    const result = await client.query<ExplainRow>(
      `EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) ${sql}`,
      params,
    );
    return result.rows.map((r) => r["QUERY PLAN"]);
  } finally {
    await client.end();
  }
}

export async function listIndexes(): Promise<IndexInfo[]> {
  const client = await createPostgresClient(databaseUrl);
  try {
    const result = await client.query<IndexInfo>(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'orders'
      ORDER BY indexname;
    `);
    return result.rows;
  } finally {
    await client.end();
  }
}

export { sleep };
