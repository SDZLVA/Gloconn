import { PHOTOS, Photo } from "@/components/blog/Photo";
import { CheapWeekendTripsFromMilanWinter } from "@/components/blog/posts/CheapWeekendTripsFromMilanWinter";
import { StrasbourgChristmasMarket2026 } from "@/components/blog/posts/StrasbourgChristmasMarket2026";

/** Milestone 63 — post slug → its body and header photo. Add new posts here and in lib/blog/posts.ts. */
export const POSTS: Record<
  string,
  { Body: (props: { today: string }) => React.ReactNode; Hero?: (props: { priority?: boolean; credit?: boolean }) => React.ReactNode }
> = {
  "strasbourg-christmas-market-2026": {
    Body: StrasbourgChristmasMarket2026,
    Hero: (props) => <Photo photo={PHOTOS.strasbourg} {...props} />,
  },
  "cheap-weekend-trips-from-milan-winter": {
    Body: CheapWeekendTripsFromMilanWinter,
    Hero: (props) => <Photo photo={PHOTOS.milan} {...props} />,
  },
};
