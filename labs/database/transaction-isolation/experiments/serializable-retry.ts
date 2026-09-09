import { createClient, readWidgetStock, resetInventory, updateWidgetStock } from "./db";
import { formatPgError, isPgErrorCode } from "../../../../shared/postgres/errors";
import { safeRollback } from "../../../../shared/postgres/runtime";

const serializationFailureCode = "40001";

async function main(): Promise<void> {
  await resetInventory(10);

  const tx1 = await createClient();
  const tx2 = await createClient();

  try {
    console.log("Scenario: SERIALIZABLE aborts one concurrent transaction and requires retry.");
    console.log("");

    await tx1.query("BEGIN ISOLATION LEVEL SERIALIZABLE");
    await tx2.query("BEGIN ISOLATION LEVEL SERIALIZABLE");

    const tx1Read = await readWidgetStock(tx1);
    const tx2Read = await readWidgetStock(tx2);
    console.log(`T1 first read: stock = ${tx1Read}`);
    console.log(`T2 first read: stock = ${tx2Read}`);

    await updateWidgetStock(tx1, tx1Read + 5);
    await tx1.query("COMMIT");
    console.log(`T1 committed update: stock = ${tx1Read + 5}`);

    try {
      await updateWidgetStock(tx2, tx2Read + 5);
      await tx2.query("COMMIT");
      throw new Error("Expected T2 to fail with serialization failure, but it committed.");
    } catch (error) {
      if (!isSerializationFailure(error)) {
        throw error;
      }

      console.log(`T2 aborted: ${formatPgError(error)}`);
      await safeRollback(tx2);
    }

    console.log("");
    console.log("Retrying T2 as a new SERIALIZABLE transaction...");

    await tx2.query("BEGIN ISOLATION LEVEL SERIALIZABLE");
    const retryRead = await readWidgetStock(tx2);
    console.log(`T2 retry read: stock = ${retryRead}`);

    await updateWidgetStock(tx2, retryRead + 5);
    await tx2.query("COMMIT");
    console.log(`T2 retry committed update: stock = ${retryRead + 5}`);

    console.log("");
    console.log("Observation:");
    console.log("- Both transactions initially read the same stock value.");
    console.log("- PostgreSQL aborted T2 with SQLSTATE 40001 after T1 committed a conflicting update.");
    console.log("- Retrying the whole transaction lets T2 read the latest committed value and commit safely.");
  } catch (error) {
    await safeRollback(tx1);
    await safeRollback(tx2);
    throw error;
  } finally {
    await tx1.end();
    await tx2.end();
  }
}

function isSerializationFailure(error: unknown): error is { code: string; message: string } {
  return isPgErrorCode(error, serializationFailureCode);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
