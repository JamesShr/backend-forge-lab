import { Client } from "pg";
import { createPostgresClient, withPostgresClient } from "../../../../shared/postgres/client";
import { safeRollback, sleep } from "../../../../shared/postgres/runtime";

export interface Account {
  id: string;
  balance: number;
  updated_at: Date;
}

export const databaseUrl =
  process.env.DATABASE_URL ?? "postgres://lab:lab@localhost:55434/backend_forge_lab";

export async function createClient(): Promise<Client> {
  return createPostgresClient(databaseUrl);
}

export async function withClient<T>(callback: (client: Client) => Promise<T>): Promise<T> {
  return withPostgresClient(databaseUrl, callback);
}

export async function setupSchema(): Promise<void> {
  await withClient(async (client) => {
    await client.query(`
      CREATE TABLE IF NOT EXISTS bank_accounts (
        id text PRIMARY KEY,
        balance integer NOT NULL CHECK (balance >= 0),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
    `);
  });
}

export async function resetAccounts(): Promise<void> {
  await setupSchema();

  await withClient(async (client) => {
    await client.query(`
      INSERT INTO bank_accounts (id, balance, updated_at)
      VALUES
        ('alpha', 100, now()),
        ('beta', 100, now())
      ON CONFLICT (id) DO UPDATE
      SET balance = EXCLUDED.balance,
          updated_at = now();
    `);
  });
}

export async function readAccounts(client: Client): Promise<Account[]> {
  const result = await client.query<Account>(
    "SELECT id, balance, updated_at FROM bank_accounts ORDER BY id",
  );

  return result.rows;
}

export async function updateAccountBalance(client: Client, accountId: string, delta: number): Promise<void> {
  await client.query(
    `
    UPDATE bank_accounts
    SET balance = balance + $1,
        updated_at = now()
    WHERE id = $2;
    `,
    [delta, accountId],
  );
}

export { safeRollback, sleep };
