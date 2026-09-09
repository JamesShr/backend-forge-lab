import { createPool, doWork, printSummary, WorkResult } from "./db";
import { Pool } from "pg";

async function runScenario(
  label: string,
  connectionTimeoutMillis: number,
  workers: number,
  holdMs: number,
): Promise<void> {
  const POOL_SIZE = 3;

  console.log(`--- ${label} ---`);
  console.log(
    `  connectionTimeoutMillis : ${
      connectionTimeoutMillis === 0 ? "0  (infinite — waits until a connection is free)" : `${connectionTimeoutMillis}ms`
    }`,
  );
  console.log(`  pool size               : ${POOL_SIZE}`);
  console.log(`  concurrent workers      : ${workers}`);
  console.log(`  hold time               : ${holdMs}ms`);
  console.log();

  const pool: Pool = createPool({ max: POOL_SIZE, connectionTimeoutMillis });

  const wallStart = Date.now();
  const results: WorkResult[] = await Promise.all(
    Array.from({ length: workers }, (_, i) =>
      doWork(pool, `worker-${i + 1}`, holdMs),
    ),
  );
  const wallMs = Date.now() - wallStart;

  console.log(`  Wall time: ${wallMs}ms`);
  printSummary(results);
  console.log();

  await pool.end();
}

async function main(): Promise<void> {
  console.log("=== Experiment: timeout-behavior ===\n");
  console.log("Same workload, two connectionTimeoutMillis configurations:\n");

  const WORKERS = 15;
  const HOLD_MS = 400;

  await runScenario("Config A: fast-fail  (connectionTimeoutMillis = 1000)", 1_000, WORKERS, HOLD_MS);
  await runScenario("Config B: infinite   (connectionTimeoutMillis = 0)",        0, WORKERS, HOLD_MS);

  console.log("Observation:");
  console.log("  Config A: requests that wait > 1000ms for a connection fail immediately.");
  console.log("            The caller gets a quick error and can decide to retry or shed.");
  console.log("  Config B: all workers eventually succeed — but wall time grows linearly:");
  console.log(`            ceil(${WORKERS} / 3) × ${HOLD_MS}ms = ${Math.ceil(WORKERS / 3) * HOLD_MS}ms minimum.`);
  console.log("  Trade-off:");
  console.log("    fast-fail  → protects upstream callers, enables circuit-breaker patterns.");
  console.log("    infinite   → maximises success rate, but queue can grow unboundedly");
  console.log("                  and a traffic spike becomes a slow, cascading backlog.");
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
