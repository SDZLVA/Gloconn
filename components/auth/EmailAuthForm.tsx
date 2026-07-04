"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { createSupabaseBrowserClient } from "@/lib/auth/client";
import {
  DEFAULT_AUTH_REDIRECT,
  REDIRECT_PARAM,
} from "@/lib/auth/constants";
import { getSupabaseEnv } from "@/lib/auth/env";
import { cn } from "@/lib/utils";
import { focusRing } from "@/lib/styles";

type EmailAuthFormProps = {
  mode: "login" | "signup";
};

/** Shared email + password form for login and signup. */
export function EmailAuthForm({ mode }: EmailAuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const redirectTo =
    searchParams.get(REDIRECT_PARAM) ?? DEFAULT_AUTH_REDIRECT;
  const { isConfigured } = getSupabaseEnv();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setSubmitting(true);

    const supabase = createSupabaseBrowserClient();

    if (mode === "signup") {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setSubmitting(false);
        return;
      }

      setMessage("Check your email to confirm your account, then sign in.");
      setSubmitting(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setSubmitting(false);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  if (!isConfigured) {
    return (
      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Add your Supabase keys to <code className="font-mono">.env.local</code>{" "}
        (see <code className="font-mono">.env.example</code>) to enable sign-in.
      </p>
    );
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-semibold text-slate-800">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="password"
          className="text-sm font-semibold text-slate-800"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          required
          minLength={6}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {message && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </p>
      )}

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting
          ? "Please wait…"
          : mode === "signup"
            ? "Create account"
            : "Sign in with email"}
      </Button>

      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-wider">
          <span className="bg-white px-3 text-slate-500">or</span>
        </div>
      </div>

      <GoogleSignInButton redirectTo={redirectTo} />

      <p className="text-center text-sm text-slate-600">
        {mode === "login" ? (
          <>
            New to Glooconn?{" "}
            <a
              href={`/signup?${REDIRECT_PARAM}=${encodeURIComponent(redirectTo)}`}
              className={cn("font-semibold text-brand-700 hover:text-brand-800", focusRing)}
            >
              Create an account
            </a>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <a
              href={`/login?${REDIRECT_PARAM}=${encodeURIComponent(redirectTo)}`}
              className={cn("font-semibold text-brand-700 hover:text-brand-800", focusRing)}
            >
              Sign in
            </a>
          </>
        )}
      </p>
    </form>
  );
}
