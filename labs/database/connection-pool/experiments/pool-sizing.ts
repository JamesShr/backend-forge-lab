import { createPool, doWork, WorkResult } from "./db";

interface SizingResult {
  poolSize: number;
  wallMs: number;
  successCount: number;
  errorCount: number;
  avgAcquireMs: number;
  avgTotalMs: number;
  p99TotalMs: number;
}

async function benchmark(
  poolSize: number,
  workers: number,
  holdMs: number,
): Promise<SizingResult> {
  const pool = createPool({ max: poolSize, connectionTimeoutMillis: 60_000 });

  const wallStart = Date.now();
  const results: WorkResult[] = await Promise.all(
    Array.from({ length: workers }, (_, i) =>
      doWork(pool, `worker-${i + 1}`, holdMs),
    ),
  );
  const wallMs = Date.now() - wallStart;

  await pool.end();

  const success    = results.filter((r) => r.status === "success");
  const acquireSorted = success.map((r) => r.acquireMs).sort((a, b) => a - b);
  const totalSorted   = success.map((r) => r.totalMs).sort((a, b) => a - b);

  const avg = (arr: number[]) =>
    arr.length === 0 ? 0 : Math.round(arr.reduce((s, v) => s + v, 0) / arr.length);
  const p99 = (arr: number[]) => arr[Math.floor(arr.length * 0.99)] ?? 0;

  return {
    poolSize,
    wallMs,
    successCount:  success.length,
    errorCount:    results.length - success.length,
    avgAcquireMs:  avg(acquireSorted),
    avgTotalMs:    avg(totalSorted),
    p99TotalMs:    p99(totalSorted),
  };
}

async function main(): Promise<void> {
  console.log("=== Experiment: pool-sizing ===\n");

  const WORKERS    = 50;
  const HOLD_MS    = 200;
  const POOL_SIZES = [2, 5, 10, 20];

  console.log(`Workload : ${WORKERS} concurrent workers, each holding a connection for ${HOLD_MS}ms`);
  console.log(`Theory   : wall time = ceil(${WORKERS} / pool_size) × ${HOLD_MS}ms`);
  console.log();

  const results: SizingResult[] = [];

  for (const size of POOL_SIZES) {
    process.stdout.write(`  Benchmarking pool size ${size.toString().padStart(2)}...`);
    const r = await benchmark(size, WORKERS, HOLD_MS);
    results.push(r);
    console.log(` ${r.wallMs}ms wall`);
  }

  console.log();

  const header =
    "pool".padEnd(8) +
    "wall(ms)".padEnd(12) +
    "success".padEnd(10) +
    "errors".padEnd(9) +
    "avg-acquire".padEnd(14) +
    "avg-total".padEnd(12) +
    "p99-total";
  console.log(header);
  console.log("-".repeat(header.length));

  for (const r of results) {
    const theory = Math.ceil(WORKERS / r.poolSize) * HOLD_MS;
    console.log(
      String(r.poolSize).padEnd(8) +
      String(r.wallMs).padEnd(12) +
      String(r.successCount).padEnd(10) +
      String(r.errorCount).padEnd(9) +
      `${r.avgAcquireMs}ms`.padEnd(14) +
      `${r.avgTotalMs}ms`.padEnd(12) +
      `${r.p99TotalMs}ms` +
      `  (theory: ${theory}ms)`,
    );
  }

  console.log();
  console.log("Observation:");
  console.log("  pool=2  : high acquire latency, wall time longest.");
  console.log("  pool=5  : significant improvement — throughput jumps.");
  console.log("  pool=10 : further improvement but gains shrink.");
  console.log("  pool=20 : diminishing returns; PostgreSQL per-connection overhead");
  console.log("            and context-switching cost may push wall time back up.");
  console.log("  Rule of thumb: optimal pool size ≈ number of CPU cores on the DB host");
  console.log("    (or slightly above for I/O-bound workloads).");
  console.log("  A pool that is too large does not hurt throughput but wastes");
  console.log("    PostgreSQL RAM (≈5-10 MB per idle backend).");
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
