import { ApiError } from "./api";

/**
 * Turn any thrown value into one readable sentence for the interface.
 *
 * Backend `detail` strings are already written for humans (e.g. "Upload a CSV
 * file." or "CSV needs these columns: … Missing: amount"), so they are preferred
 * over the generic wrapper message.
 */
export function describeError(error: unknown): string {
  if (error instanceof ApiError) {
    const detail = error.detail.trim();
    if (detail !== "") {
      return detail;
    }
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred.";
}

/** True when the failure looks like the backend being unreachable. */
export function isConnectionFailure(error: unknown): boolean {
  return error instanceof ApiError && error.status === null;
}
