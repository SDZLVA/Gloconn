import { HeroSection } from "@/components/home/HeroSection";

/**
 * Home page — welcome hero with a search card (UI only for now).
 */
export default function Home() {
  return (
    <HeroSection
      title="Search flights and hotels. Get the best package."
      subtitle="Enter your destination and dates — Glooconn finds flights and hotels, combines them into recommended packages, and lets you compare."
    />
  );
}
