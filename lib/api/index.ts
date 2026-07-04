/**
 * API foundation — env, errors, types, validation, and HTTP responses.
 * Import from `@/lib/api` in services and providers.
 */

export { getApiEnv, type ApiEnv } from "@/lib/api/env";
export {
  ApiError,
  createNotFoundError,
  createProviderError,
  createUnexpectedError,
  createValidationError,
  getApiErrorMessage,
  getHttpStatusForCode,
  isApiError,
  toApiError,
  type ApiErrorCode,
  type ValidationIssue,
} from "@/lib/api/errors";
export {
  apiError,
  apiSuccess,
  toApiResponse,
  toErrorJsonResponse,
  toJsonResponse,
  type ApiErrorBody,
  type ApiErrorResponse,
  type ApiResponse,
  type ApiSuccessResponse,
} from "@/lib/api/responses";
export {
  createInitialServiceState,
  fromServiceResult,
  runService,
  runServiceSync,
  serviceFailure,
  serviceSuccess,
  toServiceState,
  type ServiceResult,
  type ServiceState,
  type ServiceStatus,
} from "@/lib/api/types";
export { validateSearchRequest } from "@/lib/api/validation";
