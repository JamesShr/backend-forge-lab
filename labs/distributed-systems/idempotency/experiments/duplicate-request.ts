import {
  InMemoryBusinessLedger,
  PaymentService,
  callWithClientTimeout,
  printClientCallTable,
  printLedgerState,
  settleBackendCalls,
} from "./scenario";

async function main(): Promise<void> {
  console.log("=== Experiment: duplicate-request ===");
  console.log("");
  console.log("Question:");
  console.log("  What happens when a caller retries a side-effecting request after a timeout without idempotency?");
  console.log("");

  const ledger = new InMemoryBusinessLedger();
  const paymentService = new PaymentService(ledger);
  const request = {
    operationId: "checkout-1001",
    amountCents: 4200,
    label: "charge checkout-1001",
  };

  const firstAttempt = await callWithClientTimeout({
    label: "attempt 1: caller timeout",
    timeoutMs: 80,
    backendCall: () =>
      paymentService.chargeWithoutIdempotency(request, {
        commitDelayMs: 120,
        responseDelayAfterCommitMs: 80,
      }),
  });

  const retryAttempt = await callWithClientTimeout({
    label: "attempt 2: retry same operation",
    timeoutMs: 300,
    backendCall: () =>
      paymentService.chargeWithoutIdempotency(request, {
        commitDelayMs: 60,
        responseDelayAfterCommitMs: 20,
      }),
  });

  await settleBackendCalls([firstAttempt, retryAttempt]);

  printClientCallTable([firstAttempt, retryAttempt]);
  console.log("");
  printLedgerState(ledger);
  console.log("");
  console.log("Observation:");
  console.log(`  Ledger entries for checkout-1001: ${ledger.countByOperationId("checkout-1001")}`);
  console.log("  The first caller timed out, but the backend still committed the charge.");
  console.log("  The retry had no duplicate boundary, so the same business operation was executed twice.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
