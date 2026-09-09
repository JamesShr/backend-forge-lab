import { resetInventory } from "./db";

async function main(): Promise<void> {
  await resetInventory();
  console.log("Inventory data reset: widget stock = 10");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
