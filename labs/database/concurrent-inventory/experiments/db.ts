import { Client } from "pg";
import { createPostgresClient, withPostgresClient } from "../../../../shared/postgres/client";
import { safeRollback, sleep } from "../../../../shared/postgres/runtime";

export interface InventoryItem {
  id: string;
  stock: number;
  version: number;
  updated_at: Date;
}

export const databaseUrl =
  process.env.DATABASE_URL ?? "postgres://lab:lab@localhost:55433/backend_forge_lab";

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
        version integer NOT NULL DEFAULT 0,
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
      INSERT INTO inventory_items (id, stock, version, updated_at)
      VALUES ('widget', $1, 0, now())
      ON CONFLICT (id) DO UPDATE
      SET stock = EXCLUDED.stock,
          version = 0,
          updated_at = now();
      `,
      [stock],
    );
  });
}

export async function readWidget(client: Client): Promise<InventoryItem> {
  const result = await client.query<InventoryItem>(
    "SELECT id, stock, version, updated_at FROM inventory_items WHERE id = 'widget'",
  );
  const row = result.rows[0];

  if (!row) {
    throw new Error("Missing inventory_items row: widget");
  }

  return row;
}

export { safeRollback, sleep };
