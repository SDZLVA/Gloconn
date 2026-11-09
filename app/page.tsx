import { HomeSearchHero } from "@/components/home/HomeSearchHero";

/** Milestone 52: one canonical home page (?mode=… and other variants point here). */
export const metadata = { alternates: { canonical: "/" } };

/**
 * Home page — Milestone 28: mode tabs (Packages, Flights, Hotels, Mixed
 * Transport) with a one-row search bar for each.
 */
export default function Home() {
  return <HomeSearchHero />;
}
