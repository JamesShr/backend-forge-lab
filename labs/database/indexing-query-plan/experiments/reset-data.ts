import { dropAllIndexes, seedOrders, setupSchema } from "./db";

async function main(): Promise<void> {
  console.log("=== Reset: indexing-query-plan ===\n");

  console.log("Setting up schema...");
  await setupSchema();

  console.log("Dropping non-primary indexes...");
  await dropAllIndexes();

  console.log("Seeding 100,000 orders...");
  await seedOrders();

  console.log("\nReset complete.");
  console.log("  Table: orders (100,000 rows)");
  console.log("  Indexes: orders_pkey only");
  console.log("  Statistics: ANALYZE complete");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
