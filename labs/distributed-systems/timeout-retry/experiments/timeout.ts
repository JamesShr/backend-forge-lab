import { callDownstreamWithTimeout, printAttemptTable } from "./scenario";

async function main(): Promise<void> {
  console.log("=== Experiment: timeout ===");
  console.log("");
  console.log("Question:");
  console.log("  How does the timeout budget change client-visible behavior for the same downstream call?");
  console.log("");

  const results = [
    await callDownstreamWithTimeout({
      attempt: 1,
      timeoutMs: 200,
      plan: { label: "slow response with short timeout", latencyMs: 450, outcome: "success" },
    }),
    await callDownstreamWithTimeout({
      attempt: 1,
      timeoutMs: 600,
      plan: { label: "slow response with longer timeout", latencyMs: 450, outcome: "success" },
    }),
    await callDownstreamWithTimeout({
      attempt: 1,
      timeoutMs: 200,
      plan: { label: "fast transient error", latencyMs: 80, outcome: "transient-error" },
    }),
  ];

  printAttemptTable(results);
  console.log("");
  console.log("Observation:");
  console.log("  A short timeout protects caller latency, but it can abandon a downstream call that may still finish later.");
  console.log("  A longer timeout can turn the same slow downstream response into success, but caller latency rises.");
  console.log("  Fast downstream errors should be handled as errors, not confused with timeout budget exhaustion.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
