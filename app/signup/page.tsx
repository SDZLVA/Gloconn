import { Suspense } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { EmailAuthForm } from "@/components/auth/EmailAuthForm";

export const metadata = {
  title: "Create account — Glooconn",
  description: "Create a Glooconn account with Google or email.",
};

/** Signup page — Google OAuth and email/password registration. */
export default function SignupPage() {
  return (
    <Suspense fallback={<p className="text-center text-slate-600">Loading…</p>}>
      <AuthCard
        title="Create your account"
        description="Join Glooconn to save trips and plan your next adventure."
      >
        <EmailAuthForm mode="signup" />
      </AuthCard>
    </Suspense>
  );
}
