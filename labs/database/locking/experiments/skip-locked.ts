import { createClient, readWorkItems, resetWorkItems, safeRollback } from "./db";

async function main(): Promise<void> {
  await resetWorkItems();

  const holder = await createClient("locking-skip-locked-holder");
  const worker = await createClient("locking-skip-locked-worker");
  const observer = await createClient("locking-skip-locked-observer");

  try {
    console.log("Scenario: SELECT FOR UPDATE SKIP LOCKED skips locked rows and claims available work.");
    console.log("");
    console.log("Initial work queue: task-1, task-2, task-3 are pending");

    await holder.query("BEGIN");
    await holder.query("SELECT id FROM work_items WHERE id = 'task-1' FOR UPDATE");
    console.log("T1 locked task-1 and keeps the transaction open.");

    await worker.query("BEGIN");
    const claimed = await worker.query<{ id: string }>(`
      SELECT id
      FROM work_items
      WHERE status = 'pending'
      ORDER BY priority, id
      FOR UPDATE SKIP LOCKED
      LIMIT 1;
    `);
    const claimedId = claimed.rows[0]?.id;

    if (!claimedId) {
      throw new Error("Expected worker to claim task-2 while task-1 is locked.");
    }

    await worker.query(
      `
      UPDATE work_items
      SET status = 'processing',
          locked_by = 'worker-2',
          updated_at = now()
      WHERE id = $1;
      `,
      [claimedId],
    );
    await worker.query("COMMIT");
    console.log(`Worker skipped locked task-1 and claimed ${claimedId}.`);

    await holder.query("COMMIT");

    const finalRows = await readWorkItems(observer);

    console.log("");
    console.log("Final work queue:");
    console.table(finalRows);
    console.log("");
    console.log("Observation:");
    console.log("- SKIP LOCKED avoids waiting on rows already locked by another transaction.");
    console.log("- This pattern is useful for concurrent queue workers that can process any available row.");
    console.log("- It is not appropriate when callers must process rows in strict global order.");
  } catch (error) {
    await safeRollback(holder);
    await safeRollback(worker);
    throw error;
  } finally {
    await holder.end();
    await worker.end();
    await observer.end();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
