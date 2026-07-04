/**
 * Standard response shapes for the service layer.
 * UI components use these types — never provider-specific responses.
 */

import { toApiError } from "@/lib/api/errors";
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
export function toServiceState<T>(result: ServiceResult<T>): ServiceState<T> {
  if (result.success) {
    return { status: "success", data: result.data, error: null };
  }

  return { status: "error", data: null, error: result.error };
}

/** @deprecated Use toServiceState — kept for backward compatibility. */
export const fromServiceResult = toServiceState;

/** Wraps successful data in a ServiceResult. */
export function serviceSuccess<T>(data: T): ServiceResult<T> {
  return { success: true, data };
}

/** Wraps an ApiError in a ServiceResult. */
export function serviceFailure<T>(error: ApiError): ServiceResult<T> {
  return { success: false, error };
}

/**
 * Runs an async operation and returns a ServiceResult.
 * Catches unexpected throws and maps them to ApiError via toApiError.
 */
export async function runService<T>(
  operation: () => Promise<T>,
  fallbackMessage: string,
): Promise<ServiceResult<T>> {
  try {
    const data = await operation();
    return serviceSuccess(data);
  } catch (error) {
    return serviceFailure(toApiError(error, fallbackMessage));
  }
}

/**
 * Runs a sync operation and returns a ServiceResult.
 * Useful for validation helpers that do not need async.
 */
export function runServiceSync<T>(
  operation: () => T,
  fallbackMessage: string,
): ServiceResult<T> {
  try {
    const data = operation();
    return serviceSuccess(data);
  } catch (error) {
    return serviceFailure(toApiError(error, fallbackMessage));
  }
}
