import { createClient, readWidget, resetInventory } from "./db";
import { createBuyerIds, initialStock, printSummary, type PurchaseResult } from "./simulation";

async function main(): Promise<void> {
  await resetInventory(initialStock);

  console.log("Scenario: atomic conditional UPDATE prevents concurrent inventory oversell.");
  console.log("");
  console.log(`Initial stock: ${initialStock}`);
  console.log("Concurrent buyers: 20");

  const results = await Promise.all(createBuyerIds().map((buyerId) => atomicPurchase(buyerId)));
  const finalItem = await readFinalItem();

  printSummary(results, finalItem);
  console.log("");
  console.log("Observation:");
  console.log("- The stock check and decrement happen in one SQL statement.");
  console.log("- PostgreSQL serializes row updates internally, so only buyers with available stock succeed.");
  console.log("- Failed buyers get a sold-out result instead of corrupting inventory.");
}

async function atomicPurchase(buyerId: number): Promise<PurchaseResult> {
  const client = await createClient();

  try {
    const result = await client.query<{ stock: number }>(
      `
      UPDATE inventory_items
      SET stock = stock - 1,
          version = version + 1,
          updated_at = now()
      WHERE id = 'widget'
        AND stock > 0
      RETURNING stock;
      `,
    );
    const row = result.rows[0];

    if (!row) {
      return { buyerId, status: "sold-out", attempts: 1 };
    }

    return { buyerId, status: "purchased", attempts: 1, finalStock: row.stock };
  } catch (error) {
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
