import { withClient } from "./db";

async function main(): Promise<void> {
  await withClient(async (client) => {
    const isolation = await client.query<{ default_transaction_isolation: string }>(
      "SHOW default_transaction_isolation",
    );
    const rows = await client.query<{ id: string; stock: number; updated_at: Date }>(
      "SELECT id, stock, updated_at FROM inventory_items ORDER BY id",
    );

    console.log(`Default transaction isolation: ${isolation.rows[0]?.default_transaction_isolation}`);
    console.log("");
    console.table(rows.rows);
  });
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
