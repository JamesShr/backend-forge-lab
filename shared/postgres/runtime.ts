import { createPostgresClient } from "./client";

export interface WaitForPostgresOptions {
  databaseUrl: string;
  maxAttempts?: number;
  delayMs?: number;
  applicationName?: string;
}

export async function waitForPostgres(options: WaitForPostgresOptions): Promise<void> {
  const maxAttempts = options.maxAttempts ?? 30;
  const delayMs = options.delayMs ?? 1_000;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const client = await createPostgresClient(options.databaseUrl, {
        applicationName: options.applicationName,
      });
      await client.query("SELECT 1");
      await client.end();
      console.log(`PostgreSQL is ready: ${options.databaseUrl}`);
      return;
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }

      console.log(`Waiting for PostgreSQL (${attempt}/${maxAttempts})...`);
      await sleep(delayMs);
    }
  }
}

export async function sleep(milliseconds: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export async function safeRollback(client: { query: (sql: string) => Promise<unknown> }): Promise<void> {
  try {
    await client.query("ROLLBACK");
  } catch {
    // Ignore rollback failures while preserving the original experiment result.
  }
}
