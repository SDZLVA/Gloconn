/**
 * Shared redirect-path safety utilities (F-02).
 *
 * Rules:
 *  - Must start with "/"
 *  - Must NOT start with "//" (protocol-relative — could redirect off-site)
 *  - Must NOT start with a recognised scheme (javascript:, data:, http:, https:, etc.)
 *  - Falls back to `fallback` when the input is null, empty, or fails any check
 *
 * Used by:
 *  - lib/auth/middleware.ts  — post-login redirect after session refresh
 *  - app/auth/callback/route.ts — post-OAuth redirect via ?next=
 */

/** Pattern matching any URL scheme prefix (case-insensitive). */
const SCHEME_RE = /^[a-z][a-z0-9+\-.]*:/i;

/**
 * Returns `path` when it is a safe same-origin path, otherwise `fallback`.
 *
 * A safe path:
 *  - is a non-empty string
 *  - begins with exactly one "/"
 *  - does not contain a scheme (javascript:, data:, https:, etc.)
 *
 * @param path     - Untrusted redirect path from user input or query params.
 * @param fallback - Safe default path returned when `path` is rejected.
 */
export function safeRedirectPath(path: string | null | undefined, fallback: string): string {
  if (!path) return fallback;

  // Must start with "/" but not "//" (protocol-relative redirect).
  if (!path.startsWith("/") || path.startsWith("//")) return fallback;

  // Must not contain a scheme anywhere that could be smuggled after stripping.
  if (SCHEME_RE.test(path)) return fallback;

  return path;
}
