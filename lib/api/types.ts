/**
 * Standard response shapes for the service layer.
 * UI components use these types — never provider-specific responses.
 */

import type { ApiError } from "@/lib/api/errors";

/** Lifecycle status for async service calls. */
export type ServiceStatus = "idle" | "loading" | "success" | "error";

/**
 * State object for UI hooks that call services.
 * Tracks loading, success data, and errors in one place.
 */
export type ServiceState<T> = {
  status: ServiceStatus;
  data: T | null;
  error: ApiError | null;
};

/** Result returned directly from service functions (without React state). */
export type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: ApiError };

/** Creates the initial idle state for a service query hook. */
export function createInitialServiceState<T>(): ServiceState<T> {
  return { status: "idle", data: null, error: null };
}

/** Converts a ServiceResult into a ServiceState for UI consumption. */
export function fromServiceResult<T>(result: ServiceResult<T>): ServiceState<T> {
  if (result.success) {
    return { status: "success", data: result.data, error: null };
  }

  return { status: "error", data: null, error: result.error };
}

/** Wraps successful data in a ServiceResult. */
export function serviceSuccess<T>(data: T): ServiceResult<T> {
  return { success: true, data };
}

/** Wraps an ApiError in a ServiceResult. */
export function serviceFailure<T>(error: ApiError): ServiceResult<T> {
  return { success: false, error };
}
