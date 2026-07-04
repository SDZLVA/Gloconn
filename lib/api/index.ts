/**
 * API foundation — env, errors, types, and validation.
 * Import from `@/lib/api` in services and providers.
 */

export { getApiEnv, type ApiEnv } from "@/lib/api/env";
export {
  ApiError,
  getApiErrorMessage,
  toApiError,
  type ApiErrorCode,
} from "@/lib/api/errors";
export {
  createInitialServiceState,
  fromServiceResult,
  serviceFailure,
  serviceSuccess,
  type ServiceResult,
  type ServiceState,
  type ServiceStatus,
} from "@/lib/api/types";
export { validateSearchRequest } from "@/lib/api/validation";
