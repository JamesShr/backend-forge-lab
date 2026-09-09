import { resetInventory } from "./db";
import { initialStock } from "./simulation";

async function main(): Promise<void> {
  await resetInventory(initialStock);
  console.log(`Inventory data reset: widget stock = ${initialStock}, version = 0`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
