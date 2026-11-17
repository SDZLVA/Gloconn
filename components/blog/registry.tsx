import { PHOTOS, Photo } from "@/components/blog/Photo";
import { CheapWeekendTripsFromMilanWinter } from "@/components/blog/posts/CheapWeekendTripsFromMilanWinter";

/** Milestone 63 — post slug → its body and header photo. Add new posts here and in lib/blog/posts.ts. */
export const POSTS: Record<
  string,
  { Body: (props: { today: string }) => React.ReactNode; Hero?: (props: { priority?: boolean; credit?: boolean }) => React.ReactNode }
> = {
  "cheap-weekend-trips-from-milan-winter": {
    Body: CheapWeekendTripsFromMilanWinter,
    Hero: (props) => <Photo photo={PHOTOS.milan} {...props} />,
  },
};
