import { PackagePageView } from "@/components/package/PackagePageView";

export const metadata = { robots: { index: false }, title: "Package — Glooconn" };

/** Milestone 33 — a package's own page (data handed over by the results page). */
export default async function PackagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PackagePageView packageId={decodeURIComponent(id)} />;
}
