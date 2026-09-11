import {
  StructuredLogger,
  filterByCorrelationId,
  findErrorEvents,
  printResponseTable,
  printStructuredEventTable,
  runCheckoutScenario,
} from "./scenario";

async function main(): Promise<void> {
  console.log("=== Experiment: error-correlation ===");
  console.log("");
  console.log("Question:");
  console.log("  How can correlation fields connect a downstream failure to the service error and final API response?");
  console.log("");

  const logger = new StructuredLogger();
  const responses = await runCheckoutScenario(logger);
  const events = logger.snapshot();
  const failedResponse = responses.find((response) => response.outcome === "failure");

  if (!failedResponse) {
    throw new Error("Expected one failing checkout request.");
  }

  const correlatedEvents = filterByCorrelationId(events, failedResponse.correlationId);
  const errorEvents = findErrorEvents(correlatedEvents);
  const rootError = errorEvents[0];

  console.log("Caller-visible responses:");
  printResponseTable(responses);
  console.log("");
  console.log(`Query: correlationId == ${failedResponse.correlationId}`);
  printStructuredEventTable(correlatedEvents);
  console.log("");
  console.log("Failure events in the same correlation timeline:");
  printStructuredEventTable(errorEvents);
  console.log("");
  console.log("Observation:");
  console.log(`  Root failure layer: ${rootError.layer}`);
  console.log(`  Root failure event: ${rootError.event}`);
  console.log(`  Root failure kind: ${rootError.errorKind}`);
  console.log("  The downstream failure, service failure, and API 502 response are connected by the same correlationId.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
