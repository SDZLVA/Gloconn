import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import {
  AUTH_ROUTES,
  DEFAULT_AUTH_REDIRECT,
  PROTECTED_ROUTES,
  REDIRECT_PARAM,
} from "@/lib/auth/constants";
import { getSupabaseEnv } from "@/lib/auth/env";

function matchesRoute(pathname: string, routes: readonly string[]) {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

function safeRedirectPath(path: string | null, fallback: string) {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return fallback;
  }

  return path;
}

/**
 * Refreshes the Supabase session and enforces protected-route redirects.
 * Called from the root `proxy.ts`.
 */
export async function updateSession(request: NextRequest) {
  const { url, anonKey, isConfigured } = getSupabaseEnv();

  let supabaseResponse = NextResponse.next({ request });

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

        supabaseResponse = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
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
