/**
 * Standardized API response shapes for Route Handlers and JSON clients.
 *
 * Services use ServiceResult<T>; API routes convert to ApiResponse<T> for HTTP.
 */

import {
  createUnexpectedError,
  getApiErrorMessage,
  isApiError,
  type ApiError,
  type ApiErrorCode,
} from "@/lib/api/errors";
import { serviceFailure, type ServiceResult } from "@/lib/api/types";

/** Error payload sent in JSON API responses. */
export type ApiErrorBody = {
  code: ApiErrorCode;
  message: string;
  field?: string;
  issues?: { field?: string; message: string }[];
};

/** Successful JSON API response. */
export type ApiSuccessResponse<T> = {
  ok: true;
  data: T;
};

/** Failed JSON API response. */
export type ApiErrorResponse = {
  ok: false;
  error: ApiErrorBody;
};

/** Standard JSON response union for HTTP endpoints. */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/** Builds a success response body. */
export function apiSuccess<T>(data: T): ApiSuccessResponse<T> {
  return { ok: true, data };
}

/** Builds an error response body from an ApiError. */
export function apiError(error: ApiError): ApiErrorResponse {
  return {
    ok: false,
    error: {
      code: error.code,
      message: getApiErrorMessage(error),
      field: error.field,
      issues: error.issues,
    },
  };
}

/** Converts a ServiceResult into a standard ApiResponse. */
export function toApiResponse<T>(result: ServiceResult<T>): ApiResponse<T> {
  if (result.success) {
    return apiSuccess(result.data);
  }

  return apiError(result.error);
}

/** Builds a Next.js Response from a ServiceResult. */
export function toJsonResponse<T>(result: ServiceResult<T>): Response {
  const body = toApiResponse(result);

  if (body.ok) {
    return Response.json(body);
  }

  return Response.json(body, { status: result.success ? 200 : result.error.statusCode });
}

/** Converts an unknown thrown value into a JSON error Response. */
export function toErrorJsonResponse(
  error: unknown,
  fallbackMessage = "Something went wrong.",
): Response {
  const apiErr = isApiError(error)
    ? error
    : createUnexpectedError(fallbackMessage, { cause: error });

  return toJsonResponse(serviceFailure(apiErr));
}
