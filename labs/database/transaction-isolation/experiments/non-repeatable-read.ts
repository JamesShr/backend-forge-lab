import { createClient, readWidgetStock, resetInventory, sleep, updateWidgetStock } from "./db";
import { safeRollback } from "../../../../shared/postgres/runtime";

async function main(): Promise<void> {
  await resetInventory(10);

  const tx1 = await createClient();
  const tx2 = await createClient();

  try {
    console.log("Scenario: READ COMMITTED allows a transaction to observe committed changes between reads.");
    console.log("");

    await tx1.query("BEGIN ISOLATION LEVEL READ COMMITTED");
    const firstRead = await readWidgetStock(tx1);
    console.log(`T1 first read: stock = ${firstRead}`);

    await tx2.query("BEGIN");
    await updateWidgetStock(tx2, 25);
    await tx2.query("COMMIT");
    console.log("T2 committed update: stock = 25");

    await sleep(200);

    const secondRead = await readWidgetStock(tx1);
    console.log(`T1 second read: stock = ${secondRead}`);

    await tx1.query("COMMIT");

    console.log("");
    console.log("Observation:");
    console.log(`- First read saw ${firstRead}.`);
    console.log(`- Second read saw ${secondRead}.`);
    console.log("- Under READ COMMITTED, each statement reads from the latest committed snapshot.");
  } catch (error) {
    await safeRollback(tx1);
    await safeRollback(tx2);
    throw error;
  } finally {
    await tx1.end();
    await tx2.end();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
