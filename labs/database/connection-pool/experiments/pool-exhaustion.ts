import { createPool, doWork, printSummary, WorkResult } from "./db";

async function main(): Promise<void> {
  console.log("=== Experiment: pool-exhaustion ===\n");

  const POOL_SIZE   = 3;
  const WORKERS     = 20;
  const HOLD_MS     = 500;
  const TIMEOUT_MS  = 3_000;

  console.log(`Pool size          : ${POOL_SIZE}`);
  console.log(`Concurrent workers : ${WORKERS}`);
  console.log(`Hold time          : ${HOLD_MS}ms per worker (pg_sleep)`);
  console.log(`Connection timeout : ${TIMEOUT_MS}ms`);
  console.log();

  const pool = createPool({ max: POOL_SIZE, connectionTimeoutMillis: TIMEOUT_MS });

  console.log("Firing all workers simultaneously...");
  console.log("-".repeat(64));

  const wallStart = Date.now();

  const promises = Array.from({ length: WORKERS }, (_, i) => {
    const workerId = `worker-${String(i + 1).padStart(2, "0")}`;
    return doWork(pool, workerId, HOLD_MS).then((result) => {
      const icon   = result.status === "success" ? "✓" : "✗";
      const detail =
        result.status === "success"
          ? `acquire=${result.acquireMs}ms  work=${result.workMs}ms  total=${result.totalMs}ms`
          : `total=${result.totalMs}ms  (${result.error})`;
      console.log(`  ${icon} ${result.workerId}  [${result.status.padEnd(7)}]  ${detail}`);
      return result;
    });
  });

  const results: WorkResult[] = await Promise.all(promises);
  const wallMs = Date.now() - wallStart;

  console.log("-".repeat(64));
  console.log(`\nWall time: ${wallMs}ms\n`);
  console.log("Summary:");
  printSummary(results);

  console.log("\nObservation:");
  console.log(`  Pool has ${POOL_SIZE} connections — only ${POOL_SIZE} workers run concurrently.`);
  console.log(`  Remaining workers queue and wait for a free connection.`);
  console.log(`  Workers queued longer than ${TIMEOUT_MS}ms receive a timeout error.`);
  console.log(`  Theoretical minimum wall time = ceil(${WORKERS} / ${POOL_SIZE}) × ${HOLD_MS}ms = ${Math.ceil(WORKERS / POOL_SIZE) * HOLD_MS}ms`);
  console.log(`  (observed wall time includes acquire overhead and Node.js scheduling)`);

  await pool.end();
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
