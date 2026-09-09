import { explainAnalyze, withClient } from "./db";

async function main(): Promise<void> {
  console.log("=== Experiment: covering-index ===\n");

  // Ensure user_id index exists (from index-scan experiment or create fresh)
  await withClient(async (client) => {
    await client.query("CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders (user_id);");
    await client.query("DROP INDEX IF EXISTS idx_orders_covering;");
    await client.query("ANALYZE orders;");
  });

  const targetUser = "user-00042";

  // Step 1: Index Scan with heap fetch (index on user_id only, SELECT includes amount)
  console.log("Step 1: Index on user_id only — SELECT user_id, status, amount");
  console.log("  The index does not contain status/amount → heap fetch required");
  console.log("-".repeat(70));
  const plan1 = await explainAnalyze(
    "SELECT user_id, status, amount FROM orders WHERE user_id = $1",
    [targetUser],
  );
  for (const line of plan1) console.log(line);

  console.log();

  // Step 2: Create covering index
  console.log("Creating covering index on (user_id, status, amount)...");
  await withClient(async (client) => {
    await client.query(
      "CREATE INDEX idx_orders_covering ON orders (user_id) INCLUDE (status, amount);",
    );
    await client.query("ANALYZE orders;");
  });

  // Step 3: Same query — now Index Only Scan
  console.log();
  console.log("Step 2: Covering index — same SELECT user_id, status, amount");
  console.log("  All projected columns are in the index → Index Only Scan, no heap fetch");
  console.log("-".repeat(70));
  const plan2 = await explainAnalyze(
    "SELECT user_id, status, amount FROM orders WHERE user_id = $1",
    [targetUser],
  );
  for (const line of plan2) console.log(line);

  console.log();

  // Step 4: SELECT * still needs heap
  console.log("Step 3: SELECT * with covering index — still needs heap fetch");
  console.log("  created_at is not in the covering index → falls back to Index Scan");
  console.log("-".repeat(70));
  const plan3 = await explainAnalyze(
    "SELECT * FROM orders WHERE user_id = $1",
    [targetUser],
  );
  for (const line of plan3) console.log(line);

  console.log("\nObservation:");
  console.log("  Index Only Scan reads all needed data directly from the index pages.");
  console.log("  'Heap Fetches: 0' confirms no table access was needed.");
  console.log("  Covering indexes trade write overhead and index size for read speed.");
  console.log("  Only useful when the query projects a predictable, stable set of columns.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
