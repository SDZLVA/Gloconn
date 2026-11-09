import { ACCOUNTS_ON, ComingSoon } from "@/components/ui/ComingSoon";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { EmailAuthForm } from "@/components/auth/EmailAuthForm";

export const metadata = {
  robots: { index: false, follow: true },
  title: "Create account",
  description: "Create a Glooconn account with Google or email.",
};

/** Signup page — Google OAuth and email/password registration. */
export default function SignupPage() {
  if (!ACCOUNTS_ON) {
    return <ComingSoon title="Accounts are coming soon" text="Creating an account isn’t open yet. You can search and book flights, hotels and packages without one." />;
  }

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
