import { createClient, readWorkItems, resetWorkItems, safeRollback } from "./db";
import { formatPgError, isLockNotAvailable } from "./errors";

async function main(): Promise<void> {
  await resetWorkItems();

  const holder = await createClient("locking-nowait-holder");
  const contender = await createClient("locking-nowait-contender");

  try {
    console.log("Scenario: SELECT FOR UPDATE NOWAIT fails fast when the target row is already locked.");
    console.log("");
    console.log("Initial work queue: task-1, task-2, task-3 are pending");

    await holder.query("BEGIN");
    await holder.query("SELECT id FROM work_items WHERE id = 'task-1' FOR UPDATE");
    console.log("T1 locked task-1 and keeps the transaction open.");

    await contender.query("BEGIN");

    try {
      await contender.query("SELECT id FROM work_items WHERE id = 'task-1' FOR UPDATE NOWAIT");
      throw new Error("Expected SELECT FOR UPDATE NOWAIT to fail with SQLSTATE 55P03.");
    } catch (error) {
      if (!isLockNotAvailable(error)) {
        throw error;
      }

      console.log(`T2 failed immediately: ${formatPgError(error)}`);
      await safeRollback(contender);
    }

    await holder.query("COMMIT");

    const observer = await createClient("locking-nowait-observer");
    const finalRows = await readWorkItems(observer);
    await observer.end();

    console.log("");
    console.log("Final work queue:");
    console.table(finalRows);
    console.log("");
    console.log("Observation:");
    console.log("- NOWAIT changes lock acquisition from blocking to fail-fast.");
    console.log("- PostgreSQL reports SQLSTATE 55P03 when the row cannot be locked immediately.");
    console.log("- This is useful when the caller can retry, choose another unit of work, or return a busy response.");
  } catch (error) {
    await safeRollback(holder);
    await safeRollback(contender);
    throw error;
  } finally {
    await holder.end();
    await contender.end();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
