import {
  PlainTextLogger,
  printPlainLogs,
  printResponseTable,
  runCheckoutScenario,
} from "./scenario";

async function main(): Promise<void> {
  console.log("=== Experiment: plain-logs ===");
  console.log("");
  console.log("Question:");
  console.log("  What makes plain text logs difficult to use when multiple backend requests cross several layers?");
  console.log("");

  const logger = new PlainTextLogger();
  const responses = await runCheckoutScenario(logger);

  console.log("Interleaved plain text logs:");
  printPlainLogs(logger.snapshot());
  console.log("");
  console.log("Caller-visible responses:");
  printResponseTable(responses);
  console.log("");
  console.log("Observation:");
  console.log("  The lines are readable, but they do not expose requestId or correlationId as queryable fields.");
  console.log("  Repository and downstream events from different requests are interleaved.");
  console.log("  Diagnosis depends on message text and ordering instead of a stable request timeline.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
