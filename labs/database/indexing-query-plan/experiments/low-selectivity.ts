import { explainAnalyze, listIndexes, withClient } from "./db";

async function main(): Promise<void> {
  console.log("=== Experiment: low-selectivity ===\n");

  // Create btree index on status (low cardinality: 4 distinct values)
  console.log("Creating btree index on status (low cardinality: 4 distinct values)...");
  await withClient(async (client) => {
    await client.query("CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);");
    await client.query("ANALYZE orders;");
  });

  const indexes = await listIndexes();
  console.log("Current indexes:");
  for (const idx of indexes) {
    console.log(`  ${idx.indexname}`);
  }
  console.log();

  // Show distribution
  await withClient(async (client) => {
    const result = await client.query<{ status: string; count: string; pct: string }>(`
      SELECT
        status,
        count(*)::int AS count,
        round(count(*) * 100.0 / sum(count(*)) OVER (), 1)::text || '%' AS pct
      FROM orders
      GROUP BY status
      ORDER BY count DESC;
    `);
    console.log("Status distribution:");
    for (const row of result.rows) {
      console.log(`  ${row.status.padEnd(12)} ${String(Number(row.count).toLocaleString()).padStart(8)}  (${row.pct})`);
    }
    console.log();
  });

  // Case 1: high proportion — planner ignores index
  console.log("Case 1: WHERE status = 'completed'  (~60% of rows)");
  console.log("  → Planner should choose Seq Scan (index not worth it)");
  console.log("-".repeat(70));
  const plan1 = await explainAnalyze("SELECT * FROM orders WHERE status = 'completed'");
  for (const line of plan1) console.log(line);

  console.log();

  // Case 2: low proportion — planner may use index
  console.log("Case 2: WHERE status = 'cancelled'  (~5% of rows)");
  console.log("  → Planner may choose Bitmap Index Scan (selective enough)");
  console.log("-".repeat(70));
  const plan2 = await explainAnalyze("SELECT * FROM orders WHERE status = 'cancelled'");
  for (const line of plan2) console.log(line);

  console.log();

  // Case 3: force index on completed to show why planner avoided it
  console.log("Case 3: Force index scan on 'completed' to show why planner avoided it:");
  console.log("-".repeat(70));
  await withClient(async (client) => {
    await client.query("SET enable_seqscan = off;");
    const result = await client.query<{ "QUERY PLAN": string }>(
      "EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) SELECT * FROM orders WHERE status = 'completed'",
    );
    for (const row of result.rows) console.log(row["QUERY PLAN"]);
    await client.query("SET enable_seqscan = on;");
  });

  console.log("\nObservation:");
  console.log("  PostgreSQL estimates cost before executing.");
  console.log("  When a query matches a large fraction of rows, Seq Scan is cheaper than");
  console.log("  random index lookups across the heap (each index hit = one heap page fetch).");
  console.log("  The selectivity threshold is roughly 5–20% depending on table size and correlation.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
