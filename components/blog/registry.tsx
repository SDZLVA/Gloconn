import { MilanHeroArt } from "@/components/blog/art/CityArt";
import { CheapWeekendTripsFromMilanWinter } from "@/components/blog/posts/CheapWeekendTripsFromMilanWinter";

/** Milestone 63 — post slug → its body and header illustration. Add new posts here and in lib/blog/posts.ts. */
export const POSTS: Record<
  string,
  { Body: (props: { today: string }) => React.ReactNode; Hero?: (props: { className?: string }) => React.ReactNode }
> = {
  "cheap-weekend-trips-from-milan-winter": { Body: CheapWeekendTripsFromMilanWinter, Hero: MilanHeroArt },
};
