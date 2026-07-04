import { Suspense } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { EmailAuthForm } from "@/components/auth/EmailAuthForm";

export const metadata = {
  title: "Sign in — Glooconn",
  description: "Sign in to Glooconn with Google or email.",
};

/** Login page — Google OAuth and email/password sign-in. */
export default function LoginPage() {
  return (
    <Suspense fallback={<p className="text-center text-slate-600">Loading…</p>}>
      <AuthCard
        title="Welcome back"
        description="Sign in to save trips and manage your profile."
      >
        <EmailAuthForm mode="login" />
      </AuthCard>
    </Suspense>
  );
}
