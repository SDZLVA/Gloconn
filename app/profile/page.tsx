import Link from "next/link";
import { redirect } from "next/navigation";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { getCurrentUser } from "@/lib/auth/session";
import { formatSavedTripDate } from "@/lib/trips/format";

export const metadata = {
  title: "Profile — Glooconn",
  description: "View and manage your Glooconn account.",
};

/** Protected profile page — shows the signed-in user's account details. */
export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirectTo=/profile");
  }

  const memberSince = formatSavedTripDate(user.createdAt);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
      <SectionHeading
        as="h1"
        title="Your profile"
        description="Account details for your Glooconn workspace."
      />

      <Card className="p-6 sm:p-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt=""
              className="h-20 w-20 rounded-full object-cover ring-4 ring-brand-100"
            />
          ) : (
            <span className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-brand-100 text-2xl font-bold text-brand-800">
              {user.displayName.slice(0, 2).toUpperCase()}
            </span>
          )}

          <div className="flex-1 space-y-4 text-center sm:text-left">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Display name
              </p>
              <p className="text-xl font-bold text-slate-900">{user.displayName}</p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Email
              </p>
              <p className="text-base text-slate-800">{user.email}</p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Member since
              </p>
              <p className="text-base text-slate-800">{memberSince}</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/my-trips"
          className="inline-flex items-center justify-center rounded-xl bg-brand-700 px-6 py-3 text-sm font-semibold text-white motion-safe:hover:bg-brand-800"
        >
          View saved trips
        </Link>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 motion-safe:hover:bg-slate-50"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
