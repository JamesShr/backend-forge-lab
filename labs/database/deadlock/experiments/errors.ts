import { formatPgError, isPgError, isPgErrorCode } from "../../../../shared/postgres/errors";

export const deadlockDetectedCode = "40P01";

export function isDeadlockDetected(error: unknown): error is { code: string; message: string; detail?: string } {
  return isPgErrorCode(error, deadlockDetectedCode);
}

export { formatPgError, isPgError };
