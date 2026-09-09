import { formatPgError, isPgError, isPgErrorCode } from "../../../../shared/postgres/errors";

export const lockNotAvailableCode = "55P03";

export function isLockNotAvailable(error: unknown): error is { code: string; message: string; detail?: string } {
  return isPgErrorCode(error, lockNotAvailableCode);
}

export { formatPgError, isPgError };
