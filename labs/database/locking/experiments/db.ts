import { Client } from "pg";
import { createPostgresClient, withPostgresClient } from "../../../../shared/postgres/client";
import { safeRollback, sleep } from "../../../../shared/postgres/runtime";

export interface WorkItem {
  id: string;
  status: "pending" | "processing" | "done";
  priority: number;
  locked_by: string | null;
  processed_at: Date | null;
  updated_at: Date;
}

export interface ActivitySnapshot {
  pid: number;
  state: string;
  wait_event_type: string | null;
  wait_event: string | null;
  query_age_ms: number;
  query: string;
}

export const databaseUrl =
  process.env.DATABASE_URL ?? "postgres://lab:lab@localhost:55435/backend_forge_lab";

export async function createClient(applicationName?: string): Promise<Client> {
  return createPostgresClient(databaseUrl, { applicationName });
}

export async function withClient<T>(callback: (client: Client) => Promise<T>): Promise<T> {
  return withPostgresClient(databaseUrl, callback);
}

export async function setupSchema(): Promise<void> {
  await withClient(async (client) => {
    await client.query(`
      CREATE TABLE IF NOT EXISTS work_items (
        id text PRIMARY KEY,
        status text NOT NULL CHECK (status IN ('pending', 'processing', 'done')),
        priority integer NOT NULL,
        locked_by text,
        processed_at timestamptz,
        updated_at timestamptz NOT NULL DEFAULT now()
      );
    `);
  });
}

export async function resetWorkItems(): Promise<void> {
  await setupSchema();

  await withClient(async (client) => {
    await client.query(`
      INSERT INTO work_items (id, status, priority, locked_by, processed_at, updated_at)
      VALUES
        ('task-1', 'pending', 10, NULL, NULL, now()),
        ('task-2', 'pending', 20, NULL, NULL, now()),
        ('task-3', 'pending', 30, NULL, NULL, now())
      ON CONFLICT (id) DO UPDATE
      SET status = EXCLUDED.status,
          priority = EXCLUDED.priority,
          locked_by = EXCLUDED.locked_by,
          processed_at = EXCLUDED.processed_at,
          updated_at = now();
    `);
  });
}

export async function readWorkItems(client: Client): Promise<WorkItem[]> {
  const result = await client.query<WorkItem>(
    "SELECT id, status, priority, locked_by, processed_at, updated_at FROM work_items ORDER BY priority, id",
  );

  return result.rows;
}

export async function readActivityByApplicationName(
  client: Client,
  applicationName: string,
): Promise<ActivitySnapshot[]> {
  const result = await client.query<ActivitySnapshot>(
    `
    SELECT
      pid,
      state,
      wait_event_type,
      wait_event,
      floor(extract(epoch FROM (now() - query_start)) * 1000)::integer AS query_age_ms,
      query
    FROM pg_stat_activity
    WHERE application_name = $1
    ORDER BY pid;
    `,
    [applicationName],
  );

  return result.rows;
}

export async function readLockLabActivity(client: Client): Promise<ActivitySnapshot[]> {
  const result = await client.query<ActivitySnapshot>(
    `
    SELECT
      pid,
      state,
      wait_event_type,
      wait_event,
      floor(extract(epoch FROM (now() - query_start)) * 1000)::integer AS query_age_ms,
      query
    FROM pg_stat_activity
    WHERE application_name LIKE 'locking-%'
    ORDER BY application_name, pid;
    `,
  );

  return result.rows;
}

export { safeRollback, sleep };
