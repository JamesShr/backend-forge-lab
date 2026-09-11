console.log("=== Lab: observability/structured-logging ===");
console.log("");
console.log("Runtime:");
console.log("  type: script");
console.log("  infrastructure: none");
console.log("  state: in-memory per experiment run");
console.log("");
console.log("Model under observation:");
console.table([
  {
    component: "API handler",
    responsibility: "creates or receives request context and returns the caller-visible outcome",
    signal: "request.received, request.completed, request.failed",
  },
  {
    component: "checkout service",
    responsibility: "coordinates repository and downstream calls",
    signal: "checkout.reserve.started, checkout.reserve.completed, checkout.reserve.failed",
  },
  {
    component: "order repository",
    responsibility: "simulates a database lookup inside the request flow",
    signal: "order.lookup.started, order.lookup.completed",
  },
  {
    component: "inventory downstream gateway",
    responsibility: "simulates a dependency that can succeed or fail",
    signal: "inventory.reserve.completed or inventory.reserve.failed",
  },
]);
console.log("");
console.log("Experiments:");
console.table([
  {
    experiment: "plain-logs",
    focus: "interleaved human-readable lines without stable query fields",
    expectedSignal: "manual diagnosis depends on reading order and message text",
  },
  {
    experiment: "structured-logs",
    focus: "JSON events with requestId, correlationId, layer, event, and outcome",
    expectedSignal: "one request timeline can be filtered by requestId",
  },
  {
    experiment: "error-correlation",
    focus: "follow a downstream failure through service and API error events",
    expectedSignal: "all failure events share the same correlationId",
  },
]);
console.log("");
console.log("Operational notes:");
console.log("  requestId identifies one inbound request.");
console.log("  correlationId links related events across layers and service boundaries.");
console.log("  Structured logs should use stable field names so the log backend can query them.");
