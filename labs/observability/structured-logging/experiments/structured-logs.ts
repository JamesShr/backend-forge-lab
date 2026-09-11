import {
  StructuredLogger,
  filterByRequestId,
  printRequestSummary,
  printStructuredEventTable,
  printStructuredLogs,
  runCheckoutScenario,
} from "./scenario";

async function main(): Promise<void> {
  console.log("=== Experiment: structured-logs ===");
  console.log("");
  console.log("Question:");
  console.log("  How do structured logs let us query and reconstruct one request across API, service, repository, and downstream layers?");
  console.log("");

  const logger = new StructuredLogger();
  await runCheckoutScenario(logger);
  const events = logger.snapshot();
  const requestId = "req-checkout-1002";

  console.log("Structured JSON log events:");
  printStructuredLogs(events);
  console.log("");
  console.log("Request summary grouped from log fields:");
  printRequestSummary(events);
  console.log("");
  console.log(`Query: requestId == ${requestId}`);
  printStructuredEventTable(filterByRequestId(events, requestId));
  console.log("");
  console.log("Observation:");
  console.log("  Every event carries requestId, correlationId, layer, event, route, userId, and orderId.");
  console.log("  A log backend can filter one request timeline without parsing message text.");
  console.log("  The same fields can also group outcomes by request, layer, or dependency.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
