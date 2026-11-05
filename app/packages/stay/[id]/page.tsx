import { StayPackageView } from "@/components/package/StayPackageView";

export const metadata = { robots: { index: false }, title: "Package" };

/** Milestone 40b — a hotel-led package's page (data handed over by the results page). */
export default async function StayPackagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <StayPackageView stayId={decodeURIComponent(id)} />;
}
