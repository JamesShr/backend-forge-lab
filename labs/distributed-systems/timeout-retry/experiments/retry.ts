import { AttemptPlan, printRetrySummary, runRetryPolicy } from "./scenario";

const transientThenHealthy: AttemptPlan[] = [
  { label: "transient network error", latencyMs: 80, outcome: "transient-error" },
  { label: "recovered downstream", latencyMs: 70, outcome: "success" },
];

async function main(): Promise<void> {
  console.log("=== Experiment: retry ===");
  console.log("");
  console.log("Question:");
  console.log("  How does bounded retry affect a request when the downstream fails once and then recovers?");
  console.log("");

  const noRetry = await runRetryPolicy({
    name: "no retry",
    plans: transientThenHealthy,
    maxAttempts: 1,
    timeoutMs: 200,
    delayAfterFailureMs: () => 0,
  });

  printRetrySummary(noRetry);
  console.log("");

  const boundedRetry = await runRetryPolicy({
    name: "bounded retry, maxAttempts=3",
    plans: transientThenHealthy,
    maxAttempts: 3,
    timeoutMs: 200,
    delayAfterFailureMs: () => 50,
  });

  printRetrySummary(boundedRetry);
  console.log("");
  console.log("Observation:");
  console.log("  No retry keeps latency and downstream load low, but exposes transient failure to the caller.");
  console.log("  Bounded retry succeeds after recovery, but it doubles the downstream attempts in this scenario.");
  console.log("  The retry is acceptable only when the operation is retry-safe or protected by idempotency.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
