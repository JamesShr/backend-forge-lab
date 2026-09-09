import { withClient } from "./db";

async function main(): Promise<void> {
  console.log("=== Observe: indexing-query-plan ===\n");

  await withClient(async (client) => {
    // 1. Table row count
    const countResult = await client.query<{ count: string }>(
      "SELECT count(*) FROM orders;",
    );
    console.log(`Table: orders  (${Number(countResult.rows[0].count).toLocaleString()} rows)\n`);

    // 2. Current indexes
    const indexResult = await client.query<{
      indexname: string;
      indexdef: string;
    }>(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'orders'
      ORDER BY indexname;
    `);

    console.log("Indexes:");
    for (const row of indexResult.rows) {
      console.log(`  ${row.indexname}`);
      console.log(`    ${row.indexdef}`);
    }
    console.log();

    // 3. Planner statistics per column
    const statsResult = await client.query<{
      attname: string;
      n_distinct: string;
      null_frac: string;
      correlation: string;
    }>(`
      SELECT
        attname,
        n_distinct::text,
        round(null_frac::numeric, 4)::text AS null_frac,
        round(correlation::numeric, 4)::text AS correlation
      FROM pg_stats
      WHERE tablename = 'orders'
        AND attname IN ('user_id', 'status', 'amount', 'created_at')
      ORDER BY attname;
    `);

    console.log("Planner statistics (pg_stats):");
    console.log(
      "  " +
      "column".padEnd(14) +
      "n_distinct".padEnd(14) +
      "null_frac".padEnd(12) +
      "correlation",
    );
    console.log("  " + "-".repeat(54));
    for (const row of statsResult.rows) {
      console.log(
        "  " +
        row.attname.padEnd(14) +
        row.n_distinct.padEnd(14) +
        row.null_frac.padEnd(12) +
        row.correlation,
      );
    }
    console.log();

    // 4. Scan counters (reset per ANALYZE, accumulates across experiments)
    const scanResult = await client.query<{
      seq_scan: string;
      seq_tup_read: string;
      idx_scan: string;
      idx_tup_fetch: string;
    }>(`
      SELECT seq_scan, seq_tup_read, idx_scan, idx_tup_fetch
      FROM pg_stat_user_tables
      WHERE relname = 'orders';
    `);

    if (scanResult.rows.length > 0) {
      const r = scanResult.rows[0];
      console.log("Scan counters (pg_stat_user_tables, cumulative since last stats reset):");
      console.log(`  seq_scan:      ${Number(r.seq_scan).toLocaleString()}`);
      console.log(`  seq_tup_read:  ${Number(r.seq_tup_read).toLocaleString()}`);
      console.log(`  idx_scan:      ${Number(r.idx_scan).toLocaleString()}`);
      console.log(`  idx_tup_fetch: ${Number(r.idx_tup_fetch).toLocaleString()}`);
    }
  });
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
