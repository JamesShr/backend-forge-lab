import { setupSchema, resetData } from "./db";

async function main(): Promise<void> {
  console.log("=== Reset: connection-pool ===\n");

  console.log("Setting up schema...");
  await setupSchema();

  console.log("Clearing work_log...");
  await resetData();

  console.log("\nReset complete.");
  console.log("  Table: work_log (empty)");
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
