import { ACCOUNTS_ON, ComingSoon } from "@/components/ui/ComingSoon";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SavedTripsList } from "@/components/trips/SavedTripsList";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getCurrentUser } from "@/lib/auth/session";
import { getSavedTripsForUser } from "@/lib/trips/savedTrips";
import type { SavedTrip } from "@/types/trips";

export const metadata = {
  title: "My Trips",
  description: "View and manage your saved trips.",
};

/** Protected page listing the user's saved trips. */
export default async function MyTripsPage() {
  if (!ACCOUNTS_ON) {
    return <ComingSoon title="My Trips is coming soon" text="Soon you’ll be able to save trips and come back to them. For now, search and book straight from the results." />;
  }

  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirectTo=/my-trips");
  }

  let trips: SavedTrip[] = [];

  try {
    trips = await getSavedTripsForUser();
  } catch {
    trips = [];
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading
          as="h1"
          title="My Trips"
          description="Trips you saved from search results appear here."
        />
        <Link
          href="/"
          className="inline-flex shrink-0 items-center justify-center rounded-xl bg-brand-700 px-6 py-3 text-sm font-semibold text-white motion-safe:hover:bg-brand-800"
        >
          Plan a new trip
        </Link>
      </div>

      <SavedTripsList trips={trips} />
    </div>
  );
}
