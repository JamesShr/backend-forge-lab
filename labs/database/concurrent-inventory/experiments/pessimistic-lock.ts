import { createClient, readWidget, resetInventory, safeRollback, sleep } from "./db";
import { createBuyerIds, initialStock, printSummary, type PurchaseResult } from "./simulation";

const processingDelayMs = 20;

async function main(): Promise<void> {
  await resetInventory(initialStock);

  console.log("Scenario: pessimistic locking serializes concurrent inventory updates.");
  console.log("");
  console.log(`Initial stock: ${initialStock}`);
  console.log("Concurrent buyers: 20");

  const startedAt = Date.now();
  const results = await Promise.all(createBuyerIds().map((buyerId) => lockedPurchase(buyerId)));
  const elapsedMs = Date.now() - startedAt;
  const finalItem = await readFinalItem();

  printSummary(results, finalItem);
  console.log(`Elapsed time: ${elapsedMs}ms`);
  console.log("");
  console.log("Observation:");
  console.log("- SELECT FOR UPDATE locks the inventory row until the transaction commits.");
  console.log("- Buyers wait for the row lock instead of racing on stale stock values.");
  console.log("- This keeps inventory correct, but lock wait time grows under contention.");
}

async function lockedPurchase(buyerId: number): Promise<PurchaseResult> {
  const client = await createClient();

  try {
    await client.query("BEGIN");
    const result = await client.query<{ stock: number }>(
      "SELECT stock FROM inventory_items WHERE id = 'widget' FOR UPDATE",
    );
    const row = result.rows[0];

    if (!row) {
      throw new Error("Missing inventory_items row: widget");
    }

    if (row.stock <= 0) {
      await client.query("COMMIT");
      return { buyerId, status: "sold-out", attempts: 1, observedStock: row.stock };
    }

    await sleep(processingDelayMs);
    const nextStock = row.stock - 1;

    await client.query(
      `
      UPDATE inventory_items
      SET stock = $1,
          version = version + 1,
          updated_at = now()
      WHERE id = 'widget';
      `,
      [nextStock],
    );
    await client.query("COMMIT");

    return {
      buyerId,
      status: "purchased",
      attempts: 1,
      observedStock: row.stock,
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
