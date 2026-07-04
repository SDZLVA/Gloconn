"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { createSupabaseBrowserClient } from "@/lib/auth/client";
import { getSupabaseEnv } from "@/lib/auth/env";

type GoogleSignInButtonProps = {
  redirectTo: string;
};

/** Starts the Google OAuth flow via Supabase. */
export function GoogleSignInButton({ redirectTo }: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);
  const { isConfigured } = getSupabaseEnv();

  async function handleGoogleSignIn() {
    if (!isConfigured) return;

    setLoading(true);
    const supabase = createSupabaseBrowserClient();

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    });
  }

  return (
    <Button
      type="button"
      variant="secondary"
      className="w-full"
      disabled={!isConfigured || loading}
      onClick={handleGoogleSignIn}
    >
      {loading ? "Redirecting…" : "Continue with Google"}
    </Button>
  );
}
