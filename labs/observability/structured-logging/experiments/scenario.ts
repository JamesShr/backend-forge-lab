export type LogLevel = "info" | "error";
export type Layer = "api" | "service" | "repository" | "downstream";
export type Outcome = "success" | "failure";

export interface RequestContext {
  requestId: string;
  correlationId: string;
  method: string;
  route: string;
  userId: string;
  orderId: string;
}

export interface CheckoutRequest extends RequestContext {
  repositoryLatencyMs: number;
  downstreamLatencyMs: number;
  failInventory: boolean;
}

export interface CheckoutResponse {
  requestId: string;
  correlationId: string;
  orderId: string;
  statusCode: number;
  outcome: Outcome;
  message: string;
}

export interface LogEventInput {
  level: LogLevel;
  layer: Layer;
  event: string;
  message: string;
  outcome?: Outcome;
  durationMs?: number;
  statusCode?: number;
  dependency?: string;
  errorKind?: string;
  errorMessage?: string;
}

export interface PlainLogEntry {
  sequence: number;
  line: string;
}

export interface StructuredLogEvent extends LogEventInput {
  sequence: number;
  timestamp: string;
  requestId: string;
  correlationId: string;
  method: string;
  route: string;
  userId: string;
  orderId: string;
}

export interface RequestSummary {
  requestId: string;
  correlationId: string;
  orderId: string;
  totalEvents: number;
  errorEvents: number;
  finalOutcome: Outcome | "unknown";
}

interface ScenarioLogger {
  log(context: RequestContext, input: LogEventInput): void;
}

export class PlainTextLogger implements ScenarioLogger {
  private nextSequence = 1;
  private readonly entries: PlainLogEntry[] = [];

  log(_context: RequestContext, input: LogEventInput): void {
    const parts = [
      String(this.nextSequence).padStart(2, "0"),
      input.level.toUpperCase().padEnd(5),
      input.layer.padEnd(10),
      input.message,
    ];

    if (input.durationMs !== undefined) {
      parts.push(`duration=${input.durationMs}ms`);
    }

    if (input.statusCode !== undefined) {
      parts.push(`status=${input.statusCode}`);
    }

    if (input.errorKind) {
      parts.push(`error=${input.errorKind}`);
    }

    this.entries.push({
      sequence: this.nextSequence,
      line: parts.join(" | "),
    });
    this.nextSequence += 1;
  }

  snapshot(): PlainLogEntry[] {
    return [...this.entries];
  }
}

export class StructuredLogger implements ScenarioLogger {
  private nextSequence = 1;
  private readonly events: StructuredLogEvent[] = [];

  log(context: RequestContext, input: LogEventInput): void {
    this.events.push({
      sequence: this.nextSequence,
      timestamp: new Date().toISOString(),
      requestId: context.requestId,
      correlationId: context.correlationId,
      method: context.method,
      route: context.route,
      userId: context.userId,
      orderId: context.orderId,
      ...input,
    });
    this.nextSequence += 1;
  }

  snapshot(): StructuredLogEvent[] {
    return [...this.events];
  }
}

export class DownstreamInventoryError extends Error {
  constructor(orderId: string) {
    super(`inventory service rejected reservation for ${orderId}`);
    this.name = "DownstreamInventoryError";
  }
}

export function createSampleRequests(): CheckoutRequest[] {
  return [
    {
      requestId: "req-checkout-1001",
      correlationId: "corr-checkout-1001",
      method: "POST",
      route: "/checkout",
      userId: "user-42",
      orderId: "order-1001",
      repositoryLatencyMs: 30,
      downstreamLatencyMs: 90,
      failInventory: false,
    },
    {
      requestId: "req-checkout-1002",
      correlationId: "corr-checkout-1002",
      method: "POST",
      route: "/checkout",
      userId: "user-77",
      orderId: "order-1002",
      repositoryLatencyMs: 45,
      downstreamLatencyMs: 55,
      failInventory: true,
    },
  ];
}

export async function runCheckoutScenario(
  logger: ScenarioLogger,
  requests = createSampleRequests(),
): Promise<CheckoutResponse[]> {
  const api = new CheckoutApiHandler(new CheckoutService(new OrderRepository(logger), new InventoryGateway(logger), logger), logger);
  return Promise.all(requests.map((request) => api.handle(request)));
}

export function printPlainLogs(entries: PlainLogEntry[]): void {
  for (const entry of entries) {
    console.log(entry.line);
  }
}

export function printStructuredLogs(events: StructuredLogEvent[]): void {
  for (const event of events) {
    console.log(JSON.stringify(event));
  }
}

export function printResponseTable(responses: CheckoutResponse[]): void {
  console.table(
    responses.map((response) => ({
      requestId: response.requestId,
      correlationId: response.correlationId,
      orderId: response.orderId,
      statusCode: response.statusCode,
      outcome: response.outcome,
      message: response.message,
    })),
  );
}

export function printStructuredEventTable(events: StructuredLogEvent[]): void {
  console.table(
    events.map((event) => ({
      seq: event.sequence,
      requestId: event.requestId,
      layer: event.layer,
      event: event.event,
      outcome: event.outcome ?? "",
      status: event.statusCode ?? "",
      error: event.errorKind ?? "",
    })),
  );
}

export function printRequestSummary(events: StructuredLogEvent[]): void {
  console.table(summarizeByRequest(events));
}

export function filterByRequestId(events: StructuredLogEvent[], requestId: string): StructuredLogEvent[] {
  return events.filter((event) => event.requestId === requestId);
}

export function filterByCorrelationId(events: StructuredLogEvent[], correlationId: string): StructuredLogEvent[] {
  return events.filter((event) => event.correlationId === correlationId);
}

export function findErrorEvents(events: StructuredLogEvent[]): StructuredLogEvent[] {
  return events.filter((event) => event.level === "error" || event.outcome === "failure");
}

export function summarizeByRequest(events: StructuredLogEvent[]): RequestSummary[] {
  const grouped = new Map<string, StructuredLogEvent[]>();

  for (const event of events) {
    grouped.set(event.requestId, [...(grouped.get(event.requestId) ?? []), event]);
  }

  return [...grouped.values()].map((requestEvents) => {
    const firstEvent = requestEvents[0];
    const terminalEvent = [...requestEvents].reverse().find((event) => event.layer === "api" && event.outcome);

    return {
      requestId: firstEvent.requestId,
      correlationId: firstEvent.correlationId,
      orderId: firstEvent.orderId,
      totalEvents: requestEvents.length,
      errorEvents: findErrorEvents(requestEvents).length,
      finalOutcome: terminalEvent?.outcome ?? "unknown",
    };
  });
}

class CheckoutApiHandler {
  constructor(
    private readonly service: CheckoutService,
    private readonly logger: ScenarioLogger,
  ) {}

  async handle(request: CheckoutRequest): Promise<CheckoutResponse> {
    const startedAt = Date.now();
    this.logger.log(request, {
      level: "info",
      layer: "api",
      event: "request.received",
      message: "received checkout request",
    });

    try {
      await this.service.reserveCheckout(request);

      const response: CheckoutResponse = {
        requestId: request.requestId,
        correlationId: request.correlationId,
        orderId: request.orderId,
        statusCode: 200,
        outcome: "success",
        message: "checkout reserved",
      };

      this.logger.log(request, {
        level: "info",
        layer: "api",
        event: "request.completed",
        message: "checkout request completed",
        outcome: "success",
        statusCode: response.statusCode,
        durationMs: Date.now() - startedAt,
      });

      return response;
    } catch (error) {
      const response: CheckoutResponse = {
        requestId: request.requestId,
        correlationId: request.correlationId,
        orderId: request.orderId,
        statusCode: 502,
        outcome: "failure",
        message: "checkout failed because inventory reservation failed",
      };

      this.logger.log(request, {
        level: "error",
        layer: "api",
        event: "request.failed",
        message: "checkout request failed",
        outcome: "failure",
        statusCode: response.statusCode,
        durationMs: Date.now() - startedAt,
        errorKind: errorName(error),
        errorMessage: errorMessage(error),
      });

      return response;
    }
  }
}

class CheckoutService {
  constructor(
    private readonly repository: OrderRepository,
    private readonly inventoryGateway: InventoryGateway,
    private readonly logger: ScenarioLogger,
  ) {}

  async reserveCheckout(request: CheckoutRequest): Promise<void> {
    const startedAt = Date.now();
    this.logger.log(request, {
      level: "info",
      layer: "service",
      event: "checkout.reserve.started",
      message: "starting checkout reservation",
    });

    try {
      await this.repository.findOrder(request);
      await this.inventoryGateway.reserveInventory(request);
      this.logger.log(request, {
        level: "info",
        layer: "service",
        event: "checkout.reserve.completed",
        message: "checkout reservation completed",
        outcome: "success",
        durationMs: Date.now() - startedAt,
      });
    } catch (error) {
      this.logger.log(request, {
        level: "error",
        layer: "service",
        event: "checkout.reserve.failed",
        message: "checkout reservation failed",
        outcome: "failure",
        durationMs: Date.now() - startedAt,
        errorKind: errorName(error),
        errorMessage: errorMessage(error),
      });
      throw error;
    }
  }
}

class OrderRepository {
  constructor(private readonly logger: ScenarioLogger) {}

  async findOrder(request: CheckoutRequest): Promise<void> {
    const startedAt = Date.now();
    this.logger.log(request, {
      level: "info",
      layer: "repository",
      event: "order.lookup.started",
      message: "loading order from repository",
    });

    await sleep(request.repositoryLatencyMs);

    this.logger.log(request, {
      level: "info",
      layer: "repository",
      event: "order.lookup.completed",
      message: "order loaded from repository",
      outcome: "success",
      durationMs: Date.now() - startedAt,
    });
  }
}

class InventoryGateway {
  constructor(private readonly logger: ScenarioLogger) {}

  async reserveInventory(request: CheckoutRequest): Promise<void> {
    const startedAt = Date.now();
    this.logger.log(request, {
      level: "info",
      layer: "downstream",
      event: "inventory.reserve.started",
      message: "calling inventory service",
      dependency: "inventory-service",
    });

    await sleep(request.downstreamLatencyMs);

    if (request.failInventory) {
      const error = new DownstreamInventoryError(request.orderId);
      this.logger.log(request, {
        level: "error",
        layer: "downstream",
        event: "inventory.reserve.failed",
        message: "inventory service returned an error",
        outcome: "failure",
        dependency: "inventory-service",
        durationMs: Date.now() - startedAt,
        errorKind: error.name,
        errorMessage: error.message,
      });
      throw error;
    }

    this.logger.log(request, {
      level: "info",
      layer: "downstream",
      event: "inventory.reserve.completed",
      message: "inventory service reserved stock",
      outcome: "success",
      dependency: "inventory-service",
      durationMs: Date.now() - startedAt,
    });
  }
}

function errorName(error: unknown): string {
  return error instanceof Error ? error.name : "UnknownError";
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
