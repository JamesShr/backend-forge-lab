console.log("=== Lab: distributed-systems/timeout-retry ===");
console.log("");
console.log("Runtime:");
console.log("  type: script");
console.log("  infrastructure: none");
console.log("  state: generated per experiment run");
console.log("");
console.log("Policies under observation:");
console.table([
  {
    experiment: "timeout",
    focus: "per-attempt timeout budget",
    signal: "success vs timeout vs fast error",
  },
  {
    experiment: "retry",
    focus: "bounded retry",
    signal: "success rate vs attempts and total latency",
  },
  {
    experiment: "exponential-backoff",
    focus: "retry delay policy",
    signal: "retry burst vs recovery window",
  },
]);
console.log("");
console.log("Operational notes:");
console.log("  Timeout limits caller wait time, but the downstream operation may still continue.");
console.log("  Retry should be bounded and used only for retry-safe operations.");
console.log("  Backoff reduces pressure on a failing dependency at the cost of longer end-to-end latency.");
