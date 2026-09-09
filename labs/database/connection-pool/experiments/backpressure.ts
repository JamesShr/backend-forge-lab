import { createPool, doWork, printSummary, WorkResult } from "./db";
import { Pool } from "pg";

// Simple semaphore: limits how many tasks are inflight at once.
// tryAcquire() returns false immediately when the limit is reached —
// the caller sheds the request rather than queuing.
class Semaphore {
  private inflight = 0;
  constructor(private readonly limit: number) {}

  tryAcquire(): boolean {
    if (this.inflight >= this.limit) return false;
    this.inflight++;
    return true;
  }

  release(): void {
    this.inflight = Math.max(0, this.inflight - 1);
  }
}

async function runUnbounded(
  pool: Pool,
  workers: number,
  holdMs: number,
): Promise<WorkResult[]> {
  return Promise.all(
    Array.from({ length: workers }, (_, i) =>
      doWork(pool, `worker-${String(i + 1).padStart(3, "0")}`, holdMs),
    ),
  );
}

async function runWithBackpressure(
  pool: Pool,
  workers: number,
  holdMs: number,
  maxInflight: number,
): Promise<WorkResult[]> {
  const sem = new Semaphore(maxInflight);

  return Promise.all(
    Array.from({ length: workers }, (_, i) => {
      const workerId = `worker-${String(i + 1).padStart(3, "0")}`;
      if (!sem.tryAcquire()) {
        // Shed immediately — do not queue
        return Promise.resolve<WorkResult>({
          workerId,
          status: "error",
          acquireMs: 0,
          workMs: 0,
          totalMs: 0,
          error: "rejected by backpressure semaphore (inflight limit reached)",
        });
      }
      return doWork(pool, workerId, holdMs).finally(() => sem.release());
    }),
  );
}

async function main(): Promise<void> {
  console.log("=== Experiment: backpressure ===\n");

  const POOL_SIZE    = 5;
  const WORKERS      = 100;
  const HOLD_MS      = 300;
  const MAX_INFLIGHT = 10;

  console.log(`Pool size          : ${POOL_SIZE}`);
  console.log(`Concurrent workers : ${WORKERS}`);
  console.log(`Hold time          : ${HOLD_MS}ms`);
  console.log(`Semaphore limit    : ${MAX_INFLIGHT} (Strategy B only)`);
  console.log();

  // Strategy A: unbounded queue inside the pool
  {
    const pool = createPool({ max: POOL_SIZE, connectionTimeoutMillis: 60_000 });
    console.log("--- Strategy A: pool only (unbounded queue) ---");
    const wallStart = Date.now();
    const results   = await runUnbounded(pool, WORKERS, HOLD_MS);
    const wallMs    = Date.now() - wallStart;
    console.log(`  Wall time: ${wallMs}ms`);
    printSummary(results);
    console.log();
    await pool.end();
  }

  // Strategy B: pool + semaphore backpressure
  {
    const pool = createPool({ max: POOL_SIZE, connectionTimeoutMillis: 5_000 });
    console.log(`--- Strategy B: pool + semaphore (max inflight = ${MAX_INFLIGHT}) ---`);
    const wallStart = Date.now();
    const results   = await runWithBackpressure(pool, WORKERS, HOLD_MS, MAX_INFLIGHT);
    const wallMs    = Date.now() - wallStart;
    console.log(`  Wall time: ${wallMs}ms`);
    printSummary(results);
    console.log();
    await pool.end();
  }

  console.log("Observation:");
  console.log(`  Strategy A: all ${WORKERS} requests queue inside the pool.`);
  console.log(`    Expected wall time ≈ ceil(${WORKERS} / ${POOL_SIZE}) × ${HOLD_MS}ms = ${Math.ceil(WORKERS / POOL_SIZE) * HOLD_MS}ms.`);
  console.log(`    Every request eventually succeeds, but late arrivals wait a long time.`);
  console.log();
  console.log(`  Strategy B: semaphore allows at most ${MAX_INFLIGHT} inflight at once.`);
  console.log(`    Excess requests are rejected immediately (shed load).`);
  console.log(`    Expected wall time ≈ ceil(${MAX_INFLIGHT} / ${POOL_SIZE}) × ${HOLD_MS}ms = ${Math.ceil(MAX_INFLIGHT / POOL_SIZE) * HOLD_MS}ms.`);
  console.log();
  console.log("  Trade-off:");
  console.log("    Backpressure reduces tail latency and wall time for accepted requests.");
  console.log("    Shed requests receive an immediate error (a 503-like response to callers).");
  console.log("    The caller can retry with exponential backoff instead of stacking up.");
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
