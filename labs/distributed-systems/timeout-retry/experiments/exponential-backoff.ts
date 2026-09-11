import { AttemptPlan, printRetrySummary, runRetryPolicy } from "./scenario";

const repeatedTransientFailures: AttemptPlan[] = [
  { label: "temporary overload", latencyMs: 60, outcome: "transient-error" },
  { label: "temporary overload", latencyMs: 60, outcome: "transient-error" },
  { label: "temporary overload", latencyMs: 60, outcome: "transient-error" },
  { label: "recovered downstream", latencyMs: 60, outcome: "success" },
];

const jitterMs = [13, -7, 21];

function exponentialBackoffWithJitter(failedAttempt: number): number {
  const baseMs = 100;
  const maxMs = 800;
  const backoff = Math.min(maxMs, baseMs * 2 ** (failedAttempt - 1));
  return Math.max(0, backoff + (jitterMs[failedAttempt - 1] ?? 0));
}

async function main(): Promise<void> {
  console.log("=== Experiment: exponential-backoff ===");
  console.log("");
  console.log("Question:");
  console.log("  What changes when repeated retries are immediate versus spaced by exponential backoff and jitter?");
  console.log("");

  const immediateRetry = await runRetryPolicy({
    name: "immediate retry",
    plans: repeatedTransientFailures,
    maxAttempts: 4,
    timeoutMs: 200,
    delayAfterFailureMs: () => 0,
  });

  printRetrySummary(immediateRetry);
  console.log("");

  const backoffRetry = await runRetryPolicy({
    name: "exponential backoff with deterministic jitter",
    plans: repeatedTransientFailures,
    maxAttempts: 4,
    timeoutMs: 200,
    delayAfterFailureMs: exponentialBackoffWithJitter,
  });

  printRetrySummary(backoffRetry);
  console.log("");
  console.log("Observation:");
  console.log("  Both policies eventually succeed because the fourth downstream attempt is healthy.");
  console.log("  Immediate retry compresses all attempts into a short burst, which is risky when many clients retry together.");
  console.log("  Backoff increases end-to-end latency, but gives the dependency a recovery window and reduces retry synchronization.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
