import { createClient, readWidget, resetInventory, safeRollback } from "./db";
import { createBuyerIds, initialStock, printSummary, type PurchaseResult } from "./simulation";

let readersReady = 0;
let releaseWrites!: () => void;
const writeGate = new Promise<void>((resolve) => {
  releaseWrites = resolve;
});

async function main(): Promise<void> {
  await resetInventory(initialStock);

  console.log("Scenario: naive read-modify-write loses updates under concurrent purchases.");
  console.log("");
  console.log(`Initial stock: ${initialStock}`);
  console.log("Concurrent buyers: 20");

  const results = await Promise.all(createBuyerIds().map((buyerId) => naivePurchase(buyerId)));
  const finalItem = await readFinalItem();

  printSummary(results, finalItem);
  console.log("");
  console.log("Observation:");
  console.log("- Every buyer read the same original stock before any write was released.");
  console.log("- Each buyer wrote back an absolute stock value instead of an atomic decrement.");
  console.log("- The system accepted more purchases than the final stock movement can explain.");
}

async function naivePurchase(buyerId: number): Promise<PurchaseResult> {
  const client = await createClient();

  try {
    await client.query("BEGIN");
    const item = await readWidget(client);
    await waitUntilAllBuyersRead();

    if (item.stock <= 0) {
      await client.query("ROLLBACK");
      return { buyerId, status: "sold-out", attempts: 1, observedStock: item.stock };
    }

    const nextStock = item.stock - 1;
    await client.query(
      "UPDATE inventory_items SET stock = $1, version = version + 1, updated_at = now() WHERE id = 'widget'",
      [nextStock],
    );
    await client.query("COMMIT");

    return {
      buyerId,
      status: "purchased",
      attempts: 1,
      observedStock: item.stock,
      finalStock: nextStock,
    };
  } catch (error) {
    await safeRollback(client);
    return {
      buyerId,
      status: "failed",
      attempts: 1,
      message: error instanceof Error ? error.message : String(error),
    };
  } finally {
    await client.end();
  }
}

async function waitUntilAllBuyersRead(): Promise<void> {
  readersReady += 1;

  if (readersReady === createBuyerIds().length) {
    releaseWrites();
  }

  await writeGate;
}

async function readFinalItem() {
  const client = await createClient();

  try {
    return await readWidget(client);
  } finally {
    await client.end();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
