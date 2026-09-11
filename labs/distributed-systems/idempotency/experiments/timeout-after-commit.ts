import {
  InMemoryBusinessLedger,
  InMemoryIdempotencyStore,
  PaymentService,
  callWithClientTimeout,
  printClientCallTable,
  printIdempotencyStoreState,
  printLedgerState,
  settleBackendCalls,
  sleep,
} from "./scenario";

async function main(): Promise<void> {
  console.log("=== Experiment: timeout-after-commit ===");
  console.log("");
  console.log("Question:");
  console.log("  If the backend commits before the caller receives a response, can retry avoid a second side effect?");
  console.log("");

  const ledger = new InMemoryBusinessLedger();
  const idempotencyStore = new InMemoryIdempotencyStore();
  const paymentService = new PaymentService(ledger, idempotencyStore);
  const request = {
    operationId: "checkout-3001",
    amountCents: 12900,
    idempotencyKey: "idem-checkout-3001",
    label: "charge checkout-3001",
  };

  const firstAttempt = await callWithClientTimeout({
    label: "attempt 1: timeout after commit",
    timeoutMs: 140,
    backendCall: () =>
      paymentService.chargeWithIdempotency(request, {
        commitDelayMs: 90,
        responseDelayAfterCommitMs: 180,
      }),
  });

  await sleep(30);

  const retryAttempt = await callWithClientTimeout({
    label: "attempt 2: retry after timeout",
    timeoutMs: 300,
    backendCall: () =>
      paymentService.chargeWithIdempotency(request, {
        commitDelayMs: 90,
        responseDelayAfterCommitMs: 20,
      }),
  });

  await settleBackendCalls([firstAttempt, retryAttempt]);

  printClientCallTable([firstAttempt, retryAttempt]);
  console.log("");
  printLedgerState(ledger);
  console.log("");
  printIdempotencyStoreState(idempotencyStore);
  console.log("");
  console.log("Observation:");
  console.log(`  Ledger entries for checkout-3001: ${ledger.countByOperationId("checkout-3001")}`);
  console.log("  The first call timed out from the caller's perspective, but the backend had already committed.");
  console.log("  The retry used the idempotency key to return the committed result instead of charging again.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
