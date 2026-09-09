import { withPostgresClient } from "../../../../shared/postgres/client";
import { databaseUrl } from "./db";

async function main(): Promise<void> {
  console.log("=== Observe: connection-pool ===\n");

  await withPostgresClient(databaseUrl, async (client) => {
    // 1. Connection state breakdown from pg_stat_activity
    const activityResult = await client.query<{
      state: string | null;
      count: string;
    }>(`
      SELECT state, count(*) AS count
      FROM pg_stat_activity
      WHERE datname = current_database()
        AND pid != pg_backend_pid()
      GROUP BY state
      ORDER BY count DESC;
    `);

    console.log("Active connections (pg_stat_activity, excluding this session):");
    if (activityResult.rows.length === 0) {
      console.log("  (none)");
    } else {
      for (const row of activityResult.rows) {
        console.log(`  ${(row.state ?? "null").padEnd(28)} ${row.count}`);
      }
    }

    // 2. Total connections vs max_connections
    const dbResult = await client.query<{
      numbackends: string;
      max_conn: string;
    }>(`
      SELECT
        d.numbackends,
        s.setting::int AS max_conn
      FROM pg_stat_database d
      CROSS JOIN pg_settings s
      WHERE d.datname = current_database()
        AND s.name = 'max_connections';
    `);

    if (dbResult.rows.length > 0) {
      const r = dbResult.rows[0];
      console.log(`\nConnections to this database : ${r.numbackends}`);
      console.log(`PostgreSQL max_connections   : ${r.max_conn}`);
    }

    // 3. work_log summary
    const logResult = await client.query<{
      count: string;
      last_completed: string | null;
    }>(`
      SELECT
        count(*)                        AS count,
        max(completed_at)::text         AS last_completed
      FROM work_log;
    `);

    if (logResult.rows.length > 0) {
      const r = logResult.rows[0];
      console.log(`\nwork_log rows  : ${r.count}`);
      if (r.last_completed) {
        console.log(`Last completed : ${r.last_completed}`);
      }
    }
  });
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
