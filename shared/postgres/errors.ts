export interface PgErrorShape {
  code: string;
  message: string;
  detail?: string;
}

export function isPgError(error: unknown): error is PgErrorShape {
  return typeof error === "object" && error !== null && "code" in error && "message" in error;
}

export function isPgErrorCode(error: unknown, code: string): error is PgErrorShape {
  return isPgError(error) && error.code === code;
}

export function formatPgError(error: PgErrorShape): string {
  const detail = error.detail ? ` Detail: ${error.detail}` : "";

  return `SQLSTATE ${error.code} (${error.message}).${detail}`;
}
