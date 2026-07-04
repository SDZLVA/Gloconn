/**
 * Auth route configuration — single source of truth for middleware and redirects.
 */

/** Routes that require a signed-in user. */
export const PROTECTED_ROUTES = ["/my-trips", "/profile"] as const;

/** Auth pages — signed-in users are redirected away from these. */
export const AUTH_ROUTES = ["/login", "/signup"] as const;

export type ProtectedRoute = (typeof PROTECTED_ROUTES)[number];
export type AuthRoute = (typeof AUTH_ROUTES)[number];

/** Default redirect after login when no `redirectTo` query param is present. */
export const DEFAULT_AUTH_REDIRECT = "/my-trips";

/** Query param used to return users to the page they tried to visit. */
export const REDIRECT_PARAM = "redirectTo";
