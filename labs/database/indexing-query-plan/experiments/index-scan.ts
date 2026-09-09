import { explainAnalyze, listIndexes, withClient } from "./db";

async function main(): Promise<void> {
  console.log("=== Experiment: index-scan ===\n");

  // Create btree index on user_id (high cardinality)
  console.log("Creating btree index on user_id (high cardinality)...");
  await withClient(async (client) => {
    await client.query("CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders (user_id);");
    await client.query("ANALYZE orders;");
  });

  const indexes = await listIndexes();
  console.log("Current indexes:");
  for (const idx of indexes) {
    console.log(`  ${idx.indexname}`);
  }
  console.log();

  // Query: single user — very high selectivity (~10 rows out of 100,000)
  const targetUser = "user-00001";
  await withClient(async (client) => {
    const result = await client.query<{ count: string }>(
      "SELECT count(*) FROM orders WHERE user_id = $1",
      [targetUser],
    );
    console.log(`Rows for ${targetUser}: ${result.rows[0].count} (selectivity ~${(Number(result.rows[0].count) / 1000).toFixed(2)}%)`);
  });
  console.log();

  console.log(`Query: SELECT * FROM orders WHERE user_id = '${targetUser}'`);
  console.log("-".repeat(70));
  const plan = await explainAnalyze(
    "SELECT * FROM orders WHERE user_id = $1",
    [targetUser],
  );
  for (const line of plan) console.log(line);

  console.log();

  // Compare: force seq scan to show the difference
  console.log("Force Seq Scan (disable index) for comparison:");
  console.log("-".repeat(70));
  await withClient(async (client) => {
    await client.query("SET enable_indexscan = off; SET enable_bitmapscan = off;");
    const result = await client.query<{ "QUERY PLAN": string }>(
      `EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) SELECT * FROM orders WHERE user_id = $1`,
      [targetUser],
    );
    for (const row of result.rows) console.log(row["QUERY PLAN"]);
    await client.query("SET enable_indexscan = on; SET enable_bitmapscan = on;");
  });

  console.log("\nObservation:");
  console.log("  Index Scan fetches only the matching rows via the btree index.");
  console.log("  Compare 'actual time' and 'rows' between Index Scan vs. Seq Scan.");
  console.log("  High cardinality (10,000 distinct users) makes the index highly selective.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
