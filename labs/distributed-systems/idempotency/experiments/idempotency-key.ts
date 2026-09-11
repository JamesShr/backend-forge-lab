import {
  InMemoryBusinessLedger,
  InMemoryIdempotencyStore,
  PaymentService,
  callWithClientTimeout,
  printClientCallTable,
  printIdempotencyStoreState,
  printLedgerState,
} from "./scenario";

async function main(): Promise<void> {
  console.log("=== Experiment: idempotency-key ===");
  console.log("");
  console.log("Question:");
  console.log("  How does an idempotency key prevent duplicate execution for the same business operation?");
  console.log("");

  const ledger = new InMemoryBusinessLedger();
  const idempotencyStore = new InMemoryIdempotencyStore();
  const paymentService = new PaymentService(ledger, idempotencyStore);
  const originalRequest = {
    operationId: "checkout-2001",
    amountCents: 7300,
    idempotencyKey: "idem-checkout-2001",
    label: "charge checkout-2001",
  };

  const firstAttempt = await callWithClientTimeout({
    label: "attempt 1: first request",
    timeoutMs: 300,
    backendCall: () =>
      paymentService.chargeWithIdempotency(originalRequest, {
        commitDelayMs: 60,
        responseDelayAfterCommitMs: 20,
      }),
  });

  const duplicateAttempt = await callWithClientTimeout({
    label: "attempt 2: duplicate key",
    timeoutMs: 300,
    backendCall: () =>
      paymentService.chargeWithIdempotency(originalRequest, {
        commitDelayMs: 60,
        responseDelayAfterCommitMs: 20,
      }),
  });

  const conflictingAttempt = await callWithClientTimeout({
    label: "attempt 3: same key, different amount",
    timeoutMs: 300,
    backendCall: () =>
      paymentService.chargeWithIdempotency(
        {
          ...originalRequest,
          amountCents: 8100,
          label: "charge checkout-2001 with changed amount",
        },
        {
          commitDelayMs: 60,
          responseDelayAfterCommitMs: 20,
        },
      ),
  });

  printClientCallTable([firstAttempt, duplicateAttempt, conflictingAttempt]);
  console.log("");
  printLedgerState(ledger);
  console.log("");
  printIdempotencyStoreState(idempotencyStore);
  console.log("");
  console.log("Observation:");
  console.log(`  Ledger entries for checkout-2001: ${ledger.countByOperationId("checkout-2001")}`);
  console.log("  The duplicate request reused the committed result and did not execute the charge again.");
  console.log("  Reusing the same key with a different request fingerprint is rejected as a conflict.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
