import {
  createClient,
  readActivityByApplicationName,
  readWorkItems,
  resetWorkItems,
  safeRollback,
  sleep,
} from "./db";

const waiterApplicationName = "locking-row-lock-waiter";

async function main(): Promise<void> {
  await resetWorkItems();

  const holder = await createClient("locking-row-lock-holder");
  const waiter = await createClient(waiterApplicationName);
  const observer = await createClient("locking-row-lock-observer");

  try {
    console.log("Scenario: SELECT FOR UPDATE waits when another transaction already holds the row lock.");
    console.log("");
    console.log("Initial work queue: task-1, task-2, task-3 are pending");

    await holder.query("BEGIN");
    await holder.query("SELECT id FROM work_items WHERE id = 'task-1' FOR UPDATE");
    console.log("T1 locked task-1 with SELECT FOR UPDATE and keeps the transaction open.");

    await waiter.query("BEGIN");
    const startedWaitingAt = Date.now();
    const waiterLock = waiter.query("SELECT id FROM work_items WHERE id = 'task-1' FOR UPDATE");

    await sleep(250);

    const activity = await readActivityByApplicationName(observer, waiterApplicationName);
    console.log("");
    console.log("Waiter activity while T1 still holds the row lock:");
    console.table(activity);

    console.log("T1 commits and releases task-1.");
    await holder.query("COMMIT");

    await waiterLock;
    const waitedMs = Date.now() - startedWaitingAt;
    await waiter.query("COMMIT");

    const finalRows = await readWorkItems(observer);

    console.log(`T2 acquired task-1 after waiting about ${waitedMs}ms.`);
    console.log("");
    console.log("Final work queue:");
    console.table(finalRows);
    console.log("");
    console.log("Observation:");
    console.log("- A plain SELECT FOR UPDATE blocks behind an existing row lock.");
    console.log("- pg_stat_activity exposes the waiting backend and its lock wait event.");
    console.log("- This preserves correctness, but callers must tolerate lock wait latency.");
  } catch (error) {
    await safeRollback(holder);
    await safeRollback(waiter);
    throw error;
  } finally {
    await holder.end();
    await waiter.end();
    await observer.end();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
