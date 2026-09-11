console.log("=== Lab: distributed-systems/idempotency ===");
console.log("");
console.log("Runtime:");
console.log("  type: script");
console.log("  infrastructure: none");
console.log("  state: in-memory per experiment run");
console.log("");
console.log("Model under observation:");
console.table([
  {
    component: "business ledger",
    responsibility: "records the real side effect",
    signal: "number of committed receipts per operationId",
  },
  {
    component: "idempotency key store",
    responsibility: "deduplicates retry attempts for the same request fingerprint",
    signal: "reserved, committed, cached, or conflict",
  },
  {
    component: "caller timeout",
    responsibility: "limits caller wait time without cancelling backend work",
    signal: "timeout with backendMayStillRun=yes",
  },
]);
console.log("");
console.log("Experiments:");
console.table([
  {
    experiment: "duplicate-request",
    focus: "retrying a side-effecting request without an idempotency boundary",
    expectedSignal: "same operationId appears twice in the business ledger",
  },
  {
    experiment: "idempotency-key",
    focus: "same key and same request fingerprint return one cached result",
    expectedSignal: "one ledger entry, duplicate response source=idempotency-cache",
  },
  {
    experiment: "timeout-after-commit",
    focus: "caller times out after commit but before seeing the response",
    expectedSignal: "retry returns cached committed result without a second charge",
  },
]);
console.log("");
console.log("Operational notes:");
console.log("  Idempotency protects the business operation, not just the HTTP response.");
console.log("  The key must be paired with a request fingerprint so accidental key reuse becomes a conflict.");
console.log("  A timeout does not prove the backend failed; it only proves the caller stopped waiting.");
