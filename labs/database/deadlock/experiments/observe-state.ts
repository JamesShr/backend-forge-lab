import { readAccounts, withClient } from "./db";

async function main(): Promise<void> {
  await withClient(async (client) => {
    const isolation = await client.query<{ default_transaction_isolation: string }>(
      "SHOW default_transaction_isolation",
    );
    const accounts = await readAccounts(client);

    console.log(`Default transaction isolation: ${isolation.rows[0]?.default_transaction_isolation}`);
    console.log("");
    console.table(accounts);
  });
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
