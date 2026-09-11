export type ClientCallStatus = "success" | "timeout" | "error";
export type BackendResultSource = "created" | "idempotency-cache";
export type IdempotencyRecordStatus = "in-progress" | "committed";

export interface ChargeRequest {
  operationId: string;
  amountCents: number;
  idempotencyKey?: string;
  label: string;
}

export interface TimingPlan {
  commitDelayMs: number;
  responseDelayAfterCommitMs: number;
}

export interface ChargeReceipt {
  operationId: string;
  chargeId: string;
  amountCents: number;
  ledgerSequence: number;
  idempotencyKey?: string;
  committedAtMs: number;
}

export interface BackendResult {
  source: BackendResultSource;
  businessExecuted: boolean;
  receipt: ChargeReceipt;
  message: string;
}

export interface ClientCallResult {
  label: string;
  status: ClientCallStatus;
  timeoutMs: number;
  clientWaitMs: number;
  backendMayStillRun: boolean;
  response?: BackendResult;
  error?: string;
  backend: Promise<BackendResult>;
}

export interface IdempotencyRecordSnapshot {
  key: string;
  fingerprint: string;
  status: IdempotencyRecordStatus;
  responseSource: BackendResultSource | "none";
}

interface IdempotencyRecord {
  key: string;
  fingerprint: string;
  status: IdempotencyRecordStatus;
  response?: BackendResult;
}

type ReserveResult =
  | { kind: "reserved" }
  | { kind: "cached"; response: BackendResult }
  | { kind: "conflict"; expectedFingerprint: string; actualFingerprint: string }
  | { kind: "in-progress" };

export class ClientTimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(`caller timed out after ${timeoutMs}ms`);
    this.name = "ClientTimeoutError";
  }
}

export class IdempotencyConflictError extends Error {
  constructor(key: string, expectedFingerprint: string, actualFingerprint: string) {
    super(
      `idempotency key ${key} was reused with a different request fingerprint: expected ${expectedFingerprint}, got ${actualFingerprint}`,
    );
    this.name = "IdempotencyConflictError";
  }
}

export class DuplicateInProgressError extends Error {
  constructor(key: string) {
    super(`idempotency key ${key} is already in progress`);
    this.name = "DuplicateInProgressError";
  }
}

export class InMemoryBusinessLedger {
  private nextChargeNumber = 1;
  private readonly receipts: ChargeReceipt[] = [];

  commitCharge(request: ChargeRequest): ChargeReceipt {
    const receipt: ChargeReceipt = {
      operationId: request.operationId,
      chargeId: `ch_${String(this.nextChargeNumber).padStart(4, "0")}`,
      amountCents: request.amountCents,
      ledgerSequence: this.nextChargeNumber,
      idempotencyKey: request.idempotencyKey,
      committedAtMs: Date.now(),
    };

    this.nextChargeNumber += 1;
    this.receipts.push(receipt);

    return receipt;
  }

  snapshot(): ChargeReceipt[] {
    return [...this.receipts];
  }

  countByOperationId(operationId: string): number {
    return this.receipts.filter((receipt) => receipt.operationId === operationId).length;
  }
}

export class InMemoryIdempotencyStore {
  private readonly records = new Map<string, IdempotencyRecord>();

  reserveOrGet(key: string, fingerprint: string): ReserveResult {
    const existing = this.records.get(key);

    if (!existing) {
      this.records.set(key, { key, fingerprint, status: "in-progress" });
      return { kind: "reserved" };
    }

    if (existing.fingerprint !== fingerprint) {
      return {
        kind: "conflict",
        expectedFingerprint: existing.fingerprint,
        actualFingerprint: fingerprint,
      };
    }

    if (existing.status === "committed" && existing.response) {
      return { kind: "cached", response: existing.response };
    }

    return { kind: "in-progress" };
  }

  commit(key: string, response: BackendResult): void {
    const record = this.records.get(key);

    if (!record) {
      throw new Error(`Cannot commit missing idempotency record for key ${key}`);
    }

    record.status = "committed";
    record.response = response;
  }

  snapshot(): IdempotencyRecordSnapshot[] {
    return [...this.records.values()].map((record) => ({
      key: record.key,
      fingerprint: record.fingerprint,
      status: record.status,
      responseSource: record.response?.source ?? "none",
    }));
  }
}

export class PaymentService {
  constructor(
    private readonly ledger: InMemoryBusinessLedger,
    private readonly idempotencyStore?: InMemoryIdempotencyStore,
  ) {}

  async chargeWithoutIdempotency(request: ChargeRequest, timing: TimingPlan): Promise<BackendResult> {
    await sleep(timing.commitDelayMs);
    const receipt = this.ledger.commitCharge(request);
    const response: BackendResult = {
      source: "created",
      businessExecuted: true,
      receipt,
      message: "business operation executed without duplicate protection",
    };

    await sleep(timing.responseDelayAfterCommitMs);
    return response;
  }

  async chargeWithIdempotency(request: ChargeRequest, timing: TimingPlan): Promise<BackendResult> {
    if (!request.idempotencyKey) {
      throw new Error("idempotencyKey is required for chargeWithIdempotency");
    }

    if (!this.idempotencyStore) {
      throw new Error("idempotency store is not configured");
    }

    const fingerprint = requestFingerprint(request);
    const reservation = this.idempotencyStore.reserveOrGet(request.idempotencyKey, fingerprint);

    if (reservation.kind === "cached") {
      return {
        ...reservation.response,
        source: "idempotency-cache",
        businessExecuted: false,
        message: "duplicate request returned cached result for the same idempotency key",
      };
    }

    if (reservation.kind === "conflict") {
      throw new IdempotencyConflictError(
        request.idempotencyKey,
        reservation.expectedFingerprint,
        reservation.actualFingerprint,
      );
    }

    if (reservation.kind === "in-progress") {
      throw new DuplicateInProgressError(request.idempotencyKey);
    }

    await sleep(timing.commitDelayMs);
    const receipt = this.ledger.commitCharge(request);
    const response: BackendResult = {
      source: "created",
      businessExecuted: true,
      receipt,
      message: "business operation executed and recorded under the idempotency key",
    };

    this.idempotencyStore.commit(request.idempotencyKey, response);
    await sleep(timing.responseDelayAfterCommitMs);

    return response;
  }
}

export async function callWithClientTimeout(options: {
  label: string;
  timeoutMs: number;
  backendCall: () => Promise<BackendResult>;
}): Promise<ClientCallResult> {
  const startedAt = Date.now();
  const backend = options.backendCall();
  backend.catch(() => undefined);

  try {
    const response = await Promise.race([
      backend,
      sleep(options.timeoutMs).then(() => {
        throw new ClientTimeoutError(options.timeoutMs);
      }),
    ]);

    return {
      label: options.label,
      status: "success",
      timeoutMs: options.timeoutMs,
      clientWaitMs: Date.now() - startedAt,
      backendMayStillRun: false,
      response,
      backend,
    };
  } catch (error) {
    const isTimeout = error instanceof ClientTimeoutError;

    return {
      label: options.label,
      status: isTimeout ? "timeout" : "error",
      timeoutMs: options.timeoutMs,
      clientWaitMs: Date.now() - startedAt,
      backendMayStillRun: isTimeout,
      error: error instanceof Error ? error.message : String(error),
      backend,
    };
  }
}

export async function settleBackendCalls(results: ClientCallResult[]): Promise<void> {
  await Promise.allSettled(results.map((result) => result.backend));
}

export function printClientCallTable(results: ClientCallResult[]): void {
  console.table(
    results.map((result) => ({
      call: result.label,
      status: result.status,
      timeoutMs: result.timeoutMs,
      clientWaitMs: result.clientWaitMs,
      backendMayStillRun: result.backendMayStillRun ? "yes" : "no",
      source: result.response?.source ?? "none",
      businessExecuted: result.response?.businessExecuted === true ? "yes" : "no",
      chargeId: result.response?.receipt.chargeId ?? "none",
      error: result.error ?? "",
    })),
  );
}

export function printLedgerState(ledger: InMemoryBusinessLedger): void {
  const rows = ledger.snapshot().map((receipt) => ({
    sequence: receipt.ledgerSequence,
    operationId: receipt.operationId,
    chargeId: receipt.chargeId,
    amountCents: receipt.amountCents,
    idempotencyKey: receipt.idempotencyKey ?? "none",
  }));

  console.log("Business ledger:");
  console.table(rows);
}

export function printIdempotencyStoreState(store: InMemoryIdempotencyStore): void {
  console.log("Idempotency key store:");
  console.table(store.snapshot());
}

export function requestFingerprint(request: ChargeRequest): string {
  return `${request.operationId}:${request.amountCents}`;
}

export function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
