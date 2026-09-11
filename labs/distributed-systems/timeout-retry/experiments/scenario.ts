export type DownstreamOutcome = "success" | "transient-error";
export type AttemptStatus = "success" | "timeout" | "error";

export interface AttemptPlan {
  label: string;
  latencyMs: number;
  outcome: DownstreamOutcome;
}

export interface AttemptResult {
  attempt: number;
  label: string;
  downstreamLatencyMs: number;
  timeoutMs: number;
  clientWaitMs: number;
  status: AttemptStatus;
  retryable: boolean;
  downstreamMayStillRun: boolean;
  nextDelayMs?: number;
  message: string;
}

export interface RetryPolicyResult {
  name: string;
  maxAttempts: number;
  timeoutMs: number;
  results: AttemptResult[];
  finalStatus: AttemptStatus;
  totalAttempts: number;
  totalClientWaitMs: number;
  requestAmplification: string;
}

export class TimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(`client timed out after ${timeoutMs}ms`);
    this.name = "TimeoutError";
  }
}

export class DownstreamError extends Error {
  constructor(label: string) {
    super(`${label} returned a transient error`);
    this.name = "DownstreamError";
  }
}

export async function callDownstreamWithTimeout(options: {
  attempt: number;
  plan: AttemptPlan;
  timeoutMs: number;
}): Promise<AttemptResult> {
  const startedAt = Date.now();
  const downstream = simulateDownstream(options.plan);
  downstream.catch(() => undefined);

  try {
    await Promise.race([
      downstream,
      sleep(options.timeoutMs).then(() => {
        throw new TimeoutError(options.timeoutMs);
      }),
    ]);

    return {
      attempt: options.attempt,
      label: options.plan.label,
      downstreamLatencyMs: options.plan.latencyMs,
      timeoutMs: options.timeoutMs,
      clientWaitMs: Date.now() - startedAt,
      status: "success",
      retryable: false,
      downstreamMayStillRun: false,
      message: "downstream completed before the timeout budget",
    };
  } catch (error) {
    const status = error instanceof TimeoutError ? "timeout" : "error";

    return {
      attempt: options.attempt,
      label: options.plan.label,
      downstreamLatencyMs: options.plan.latencyMs,
      timeoutMs: options.timeoutMs,
      clientWaitMs: Date.now() - startedAt,
      status,
      retryable: true,
      downstreamMayStillRun: status === "timeout" && options.plan.latencyMs > options.timeoutMs,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function runRetryPolicy(options: {
  name: string;
  plans: AttemptPlan[];
  maxAttempts: number;
  timeoutMs: number;
  delayAfterFailureMs: (failedAttempt: number) => number;
}): Promise<RetryPolicyResult> {
  const results: AttemptResult[] = [];
  const startedAt = Date.now();

  for (let attempt = 1; attempt <= options.maxAttempts; attempt += 1) {
    const plan = options.plans[Math.min(attempt - 1, options.plans.length - 1)];
    const result = await callDownstreamWithTimeout({
      attempt,
      plan,
      timeoutMs: options.timeoutMs,
    });

    results.push(result);

    if (result.status === "success") {
      break;
    }

    if (attempt < options.maxAttempts) {
      const delayMs = options.delayAfterFailureMs(attempt);
      result.nextDelayMs = delayMs;
      await sleep(delayMs);
    }
  }

  const finalStatus = results.at(-1)?.status ?? "error";
  const totalAttempts = results.length;

  return {
    name: options.name,
    maxAttempts: options.maxAttempts,
    timeoutMs: options.timeoutMs,
    results,
    finalStatus,
    totalAttempts,
    totalClientWaitMs: Date.now() - startedAt,
    requestAmplification: `${totalAttempts}x`,
  };
}

export function printAttemptTable(results: AttemptResult[]): void {
  console.table(
    results.map((result) => ({
      attempt: result.attempt,
      case: result.label,
      downstreamMs: result.downstreamLatencyMs,
      timeoutMs: result.timeoutMs,
      clientWaitMs: result.clientWaitMs,
      status: result.status,
      retryable: result.retryable ? "yes" : "no",
      downstreamMayStillRun: result.downstreamMayStillRun ? "yes" : "no",
      nextDelayMs: result.nextDelayMs ?? 0,
    })),
  );
}

export function printRetrySummary(result: RetryPolicyResult): void {
  console.log(`Policy: ${result.name}`);
  console.log(`Max attempts: ${result.maxAttempts}`);
  console.log(`Per-attempt timeout: ${result.timeoutMs}ms`);
  console.log(`Final status: ${result.finalStatus}`);
  console.log(`Total attempts: ${result.totalAttempts}`);
  console.log(`Request amplification: ${result.requestAmplification}`);
  console.log(`Total client wait: ${result.totalClientWaitMs}ms`);
  printAttemptTable(result.results);
}

export function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function simulateDownstream(plan: AttemptPlan): Promise<void> {
  await sleep(plan.latencyMs);

  if (plan.outcome === "transient-error") {
    throw new DownstreamError(plan.label);
  }
}
