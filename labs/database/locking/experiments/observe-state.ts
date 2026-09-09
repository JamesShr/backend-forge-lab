import { readLockLabActivity, readWorkItems, withClient } from "./db";

async function main(): Promise<void> {
  await withClient(async (client) => {
    const isolation = await client.query<{ default_transaction_isolation: string }>(
      "SHOW default_transaction_isolation",
    );
    const rows = await readWorkItems(client);
    const activity = await readLockLabActivity(client);

    console.log(`Default transaction isolation: ${isolation.rows[0]?.default_transaction_isolation}`);
    console.log("");
    console.log("Work items:");
    console.table(rows);
    console.log("");
    console.log("Lock lab activity:");
    console.table(activity);
  });
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
