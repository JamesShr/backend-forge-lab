import { createClient, readWidget, resetInventory, safeRollback, sleep } from "./db";
import { createBuyerIds, initialStock, printSummary, type PurchaseResult } from "./simulation";

const maxAttempts = 30;
const conflictDelayMs = 10;
const processingDelayMs = 20;

async function main(): Promise<void> {
  await resetInventory(initialStock);

  console.log("Scenario: optimistic locking detects conflicts and retries the whole purchase operation.");
  console.log("");
  console.log(`Initial stock: ${initialStock}`);
  console.log("Concurrent buyers: 20");

  const results = await Promise.all(createBuyerIds().map((buyerId) => optimisticPurchase(buyerId)));
  const finalItem = await readFinalItem();

  printSummary(results, finalItem);
  console.log("");
  console.log("Observation:");
  console.log("- Each buyer reads stock with a version number.");
  console.log("- A buyer can update only when the row still has the same version.");
  console.log("- Version conflicts require retrying the whole read-check-update operation.");
}

async function optimisticPurchase(buyerId: number): Promise<PurchaseResult> {
  const client = await createClient();
  let attempts = 0;

  try {
    while (attempts < maxAttempts) {
      attempts += 1;

      await client.query("BEGIN");
      const item = await readWidget(client);

      if (item.stock <= 0) {
        await client.query("COMMIT");
        return { buyerId, status: "sold-out", attempts, observedStock: item.stock };
      }

      await sleep(processingDelayMs);

      const result = await client.query<{ stock: number; version: number }>(
        `
        UPDATE inventory_items
        SET stock = stock - 1,
            version = version + 1,
            updated_at = now()
        WHERE id = 'widget'
          AND stock > 0
          AND version = $1
        RETURNING stock, version;
        `,
        [item.version],
      );
      const row = result.rows[0];

      if (row) {
        await client.query("COMMIT");
        return {
          buyerId,
          status: "purchased",
          attempts,
          observedStock: item.stock,
          finalStock: row.stock,
        };
      }

      await client.query("ROLLBACK");
      await sleep(conflictDelayMs);
    }

    return {
      buyerId,
      status: "conflict",
      attempts,
      message: "Version kept changing before the purchase could commit.",
    };
  } catch (error) {
    await safeRollback(client);
    return {
      buyerId,
      status: "failed",
      attempts,
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
