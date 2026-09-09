import { explainAnalyze, listIndexes, withClient } from "./db";

async function main(): Promise<void> {
  console.log("=== Experiment: seq-scan ===\n");

  const indexes = await listIndexes();
  console.log("Current indexes:");
  for (const idx of indexes) {
    console.log(`  ${idx.indexname}`);
  }
  console.log();

  // Count rows by status for context
  await withClient(async (client) => {
    const result = await client.query<{ status: string; count: string }>(`
      SELECT status, count(*)::int AS count
      FROM orders
      GROUP BY status
      ORDER BY count DESC;
    `);
    console.log("Row distribution:");
    for (const row of result.rows) {
      console.log(`  ${row.status.padEnd(12)} ${Number(row.count).toLocaleString()} rows`);
    }
    console.log();
  });

  // Query 1: filter by status (no index)
  console.log("Query: SELECT * FROM orders WHERE status = 'pending'  (no index on status)");
  console.log("-".repeat(70));
  const plan1 = await explainAnalyze("SELECT * FROM orders WHERE status = 'pending'");
  for (const line of plan1) console.log(line);

  console.log();

  // Query 2: filter by user_id (no index)
  console.log("Query: SELECT * FROM orders WHERE user_id = 'user-00001'  (no index on user_id)");
  console.log("-".repeat(70));
  const plan2 = await explainAnalyze("SELECT * FROM orders WHERE user_id = $1", ["user-00001"]);
  for (const line of plan2) console.log(line);

  console.log("\nObservation:");
  console.log("  Both queries use Seq Scan — PostgreSQL reads every row in the table.");
  console.log("  Notice the cost and actual time. This is the baseline before any index.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
