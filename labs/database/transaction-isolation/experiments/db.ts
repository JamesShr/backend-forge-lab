import { Client } from "pg";
import { createPostgresClient, withPostgresClient } from "../../../../shared/postgres/client";
import { sleep } from "../../../../shared/postgres/runtime";

export const databaseUrl =
  process.env.DATABASE_URL ?? "postgres://lab:lab@localhost:55432/backend_forge_lab";

export async function createClient(): Promise<Client> {
  return createPostgresClient(databaseUrl);
}

export async function withClient<T>(callback: (client: Client) => Promise<T>): Promise<T> {
  return withPostgresClient(databaseUrl, callback);
}

export async function setupSchema(): Promise<void> {
  await withClient(async (client) => {
    await client.query(`
      CREATE TABLE IF NOT EXISTS inventory_items (
        id text PRIMARY KEY,
        stock integer NOT NULL CHECK (stock >= 0),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
    `);
  });
}

export async function resetInventory(stock = 10): Promise<void> {
  await setupSchema();

  await withClient(async (client) => {
    await client.query(
      `
      INSERT INTO inventory_items (id, stock, updated_at)
      VALUES ('widget', $1, now())
      ON CONFLICT (id) DO UPDATE
      SET stock = EXCLUDED.stock,
          updated_at = now();
      `,
      [stock],
    );
  });
}

export async function readWidgetStock(client: Client): Promise<number> {
  const result = await client.query<{ stock: number }>(
    "SELECT stock FROM inventory_items WHERE id = 'widget'",
  );
  const row = result.rows[0];

  if (!row) {
    throw new Error("Missing inventory_items row: widget");
  }

  return row.stock;
}

export async function updateWidgetStock(client: Client, stock: number): Promise<void> {
  await client.query("UPDATE inventory_items SET stock = $1, updated_at = now() WHERE id = 'widget'", [stock]);
}

export { sleep };
