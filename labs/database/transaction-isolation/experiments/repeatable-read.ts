import { createClient, readWidgetStock, resetInventory, sleep, updateWidgetStock } from "./db";
import { safeRollback } from "../../../../shared/postgres/runtime";

async function main(): Promise<void> {
  await resetInventory(10);

  const tx1 = await createClient();
  const tx2 = await createClient();

  try {
    console.log("Scenario: REPEATABLE READ keeps a stable snapshot inside the transaction.");
    console.log("");

    await tx1.query("BEGIN ISOLATION LEVEL REPEATABLE READ");
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

    const outsideTx = await createClient();
    const committedRead = await readWidgetStock(outsideTx);
    await outsideTx.end();

    console.log("");
    console.log("Observation:");
    console.log(`- First read inside T1 saw ${firstRead}.`);
    console.log(`- Second read inside T1 saw ${secondRead}.`);
    console.log(`- A new transaction sees committed stock = ${committedRead}.`);
    console.log("- Under REPEATABLE READ, T1 keeps reading from its original transaction snapshot.");
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
