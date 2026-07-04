/**
 * Standardized API error types used across services and providers.
 */

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "PROVIDER_ERROR"
  | "NOT_FOUND"
  | "UNKNOWN";

/** Structured error returned by services when a request fails. */
export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly statusCode?: number;
  readonly cause?: unknown;

  constructor(
    message: string,
    code: ApiErrorCode = "UNKNOWN",
    options?: { statusCode?: number; cause?: unknown },
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.statusCode = options?.statusCode;
    this.cause = options?.cause;
  }
}

/** Converts any thrown value into a consistent ApiError. */
export function toApiError(
  error: unknown,
  fallbackMessage = "Something went wrong.",
): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error) {
    return new ApiError(error.message, "PROVIDER_ERROR", { cause: error });
  }

  return new ApiError(fallbackMessage, "UNKNOWN", { cause: error });
}

/** User-friendly message for displaying in the UI. */
export function getApiErrorMessage(error: ApiError): string {
  switch (error.code) {
    case "VALIDATION_ERROR":
      return error.message;
    case "NOT_FOUND":
      return error.message;
    case "PROVIDER_ERROR":
      return "We could not load travel data right now. Please try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}
