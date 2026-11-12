import { PackageBookingView } from "@/components/package/PackageBookingView";

export const metadata = { robots: { index: false }, title: "Book your trip" };

/** Milestone 58 — booking options for a package (opened from "Continue to booking"). */
export default async function PackageBookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ flight?: string }>;
}) {
  const { id } = await params;
  const { flight } = await searchParams;
  return <PackageBookingView packageId={decodeURIComponent(id)} flightId={typeof flight === "string" ? flight : null} />;
}
