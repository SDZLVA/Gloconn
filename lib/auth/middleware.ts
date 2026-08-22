import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import {
  AUTH_ROUTES,
  DEFAULT_AUTH_REDIRECT,
  PROTECTED_ROUTES,
  REDIRECT_PARAM,
} from "@/lib/auth/constants";
import { getSupabaseEnv } from "@/lib/auth/env";
import { safeRedirectPath } from "@/lib/auth/redirect";

function matchesRoute(pathname: string, routes: readonly string[]) {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export type UpdateSessionOptions = {
  /**
   * Factory for `NextResponse.next` that forwards CSP/nonce request headers
   * so Next.js can stamp matching nonces onto SSR scripts.
   */
  createNextResponse: () => NextResponse;
};

/**
 * Refreshes the Supabase session and enforces protected-route redirects.
 * Called from the root `proxy.ts`.
 */
export async function updateSession(
  request: NextRequest,
  options?: UpdateSessionOptions,
) {
  const createNext =
    options?.createNextResponse ?? (() => NextResponse.next({ request }));

  const { url, anonKey, isConfigured } = getSupabaseEnv();

  let supabaseResponse = createNext();

  if (!isConfigured) {
    return supabaseResponse;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        supabaseResponse = createNext();

        cookiesToSet.forEach(({ name, value, options: cookieOptions }) => {
          supabaseResponse.cookies.set(name, value, cookieOptions);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (!user && matchesRoute(pathname, PROTECTED_ROUTES)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set(REDIRECT_PARAM, pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user && matchesRoute(pathname, AUTH_ROUTES)) {
    const redirectTo = safeRedirectPath(
      request.nextUrl.searchParams.get(REDIRECT_PARAM),
      DEFAULT_AUTH_REDIRECT,
    );
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = redirectTo;
    homeUrl.search = "";
    return NextResponse.redirect(homeUrl);
  }

  return supabaseResponse;
}
