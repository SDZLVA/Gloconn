import { NextResponse } from "next/server";
import { DEFAULT_AUTH_REDIRECT } from "@/lib/auth/constants";
import { safeRedirectPath } from "@/lib/auth/redirect";
import { createSupabaseServerClient } from "@/lib/auth/server";

/**
 * Handles OAuth and email confirmation redirects from Supabase.
 *
 * Security (F-02): the `?next=` query parameter is validated with
 * safeRedirectPath() before use. Protocol-relative URLs (//evil.com),
 * scheme URLs (javascript:, https:, data:), and empty values all fall
 * back to DEFAULT_AUTH_REDIRECT so an attacker cannot craft a redirect
 * to an external site via the OAuth callback.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  // F-02: validate the ?next= parameter before constructing the redirect URL.
  const rawNext = searchParams.get("next");
  const next = safeRedirectPath(rawNext, DEFAULT_AUTH_REDIRECT);

  if (code) {
    const supabase = await createSupabaseServerClient();

    if (!supabase) {
      return NextResponse.redirect(`${origin}/login?error=auth_not_configured`);
    }

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
