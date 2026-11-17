import { CheapWeekendTripsFromMilanWinter } from "@/components/blog/posts/CheapWeekendTripsFromMilanWinter";

/** Milestone 63 — post slug → its body. Add new posts here and in lib/blog/posts.ts. */
export const POST_BODIES: Record<string, (props: { today: string }) => React.ReactNode> = {
  "cheap-weekend-trips-from-milan-winter": CheapWeekendTripsFromMilanWinter,
};
