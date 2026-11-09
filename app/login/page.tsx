import { ACCOUNTS_ON, ComingSoon } from "@/components/ui/ComingSoon";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { EmailAuthForm } from "@/components/auth/EmailAuthForm";

export const metadata = {
  robots: { index: false, follow: true },
  title: "Sign in",
  description: "Sign in to Glooconn with Google or email.",
};

/** Login page — Google OAuth and email/password sign-in. */
export default function LoginPage() {
  if (!ACCOUNTS_ON) {
    return <ComingSoon title="Accounts are coming soon" text="Sign-in isn’t open yet. You can search and book flights, hotels and packages without an account." />;
  }

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
