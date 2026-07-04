/**
 * Application errors — reusable, typed errors for services and API routes.
 */

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "PROVIDER_ERROR"
  | "NOT_FOUND"
  | "UNKNOWN";

/** Optional field-level detail for validation failures. */
export type ValidationIssue = {
  field?: string;
  message: string;
};

/**
 * Structured application error returned by services and API routes.
 * UI shows `getApiErrorMessage(error)` — not raw provider messages.
 */
export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly statusCode: number;
  readonly field?: string;
  readonly issues?: ValidationIssue[];
  readonly cause?: unknown;

  constructor(
    message: string,
    code: ApiErrorCode = "UNKNOWN",
    options?: {
      statusCode?: number;
      field?: string;
      issues?: ValidationIssue[];
      cause?: unknown;
    },
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.statusCode = options?.statusCode ?? getHttpStatusForCode(code);
    this.field = options?.field;
    this.issues = options?.issues;
    this.cause = options?.cause;
  }
}

/** Returns true when a value is an ApiError. */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/** Maps an error code to the default HTTP status for API responses. */
export function getHttpStatusForCode(code: ApiErrorCode): number {
  switch (code) {
    case "VALIDATION_ERROR":
      return 400;
    case "NOT_FOUND":
      return 404;
    case "PROVIDER_ERROR":
      return 502;
    default:
      return 500;
  }
}

/** Creates a validation error (HTTP 400). */
export function createValidationError(
  message: string,
  options?: { field?: string; issues?: ValidationIssue[] },
): ApiError {
  return new ApiError(message, "VALIDATION_ERROR", options);
}

/** Creates a provider/data-source error (HTTP 502). */
export function createProviderError(
  message: string,
  options?: { cause?: unknown },
): ApiError {
  return new ApiError(message, "PROVIDER_ERROR", options);
}

/** Creates a not-found error (HTTP 404). */
export function createNotFoundError(
  message: string,
  options?: { field?: string },
): ApiError {
  return new ApiError(message, "NOT_FOUND", options);
}

/** Creates an unexpected error (HTTP 500). */
export function createUnexpectedError(
  message = "Something went wrong.",
  options?: { cause?: unknown },
): ApiError {
  return new ApiError(message, "UNKNOWN", options);
}

/**
 * Converts any thrown value into a consistent ApiError.
 * Known ApiError values pass through; everything else becomes PROVIDER_ERROR or UNKNOWN.
 */
export function toApiError(
  error: unknown,
  fallbackMessage = "Something went wrong.",
): ApiError {
  if (isApiError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return createProviderError(fallbackMessage, { cause: error });
  }

  return createUnexpectedError(fallbackMessage, { cause: error });
}

/** User-friendly message for displaying in the UI. */
export function getApiErrorMessage(error: ApiError): string {
  switch (error.code) {
    case "VALIDATION_ERROR":
    case "NOT_FOUND":
      return error.message;
    case "PROVIDER_ERROR":
      return "We could not load travel data right now. Please try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}
