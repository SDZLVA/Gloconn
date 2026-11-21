import { PHOTOS, Photo } from "@/components/blog/Photo";
import { TromsoPolarNight2026 } from "@/components/blog/posts/TromsoPolarNight2026";
import { BudapestChristmasMarkets2026 } from "@/components/blog/posts/BudapestChristmasMarkets2026";
import { CheapWeekendTripsFromMilanWinter } from "@/components/blog/posts/CheapWeekendTripsFromMilanWinter";
import { PragueChristmasMarkets2026 } from "@/components/blog/posts/PragueChristmasMarkets2026";
import { ViennaChristmasMarkets2026 } from "@/components/blog/posts/ViennaChristmasMarkets2026";
import { StrasbourgChristmasMarket2026 } from "@/components/blog/posts/StrasbourgChristmasMarket2026";

/** Milestone 63 — post slug → its body and header photo. Add new posts here and in lib/blog/posts.ts. */
export const POSTS: Record<
  string,
  { Body: (props: { today: string }) => React.ReactNode; Hero?: (props: { priority?: boolean; credit?: boolean }) => React.ReactNode }
> = {
  "budapest-christmas-markets-2026": {
    Body: BudapestChristmasMarkets2026,
    Hero: (props) => <Photo photo={PHOTOS.budapestBasilica} {...props} />,
  },
  "tromso-polar-night-northern-lights-2026": {
    Body: TromsoPolarNight2026,
    Hero: (props) => <Photo photo={PHOTOS.tromsoAurora} {...props} />,
  },
  "vienna-christmas-markets-2026": {
    Body: ViennaChristmasMarkets2026,
    Hero: (props) => <Photo photo={PHOTOS.viennaChristkindlmarkt} {...props} />,
  },
  "prague-christmas-markets-2026": {
    Body: PragueChristmasMarkets2026,
    Hero: (props) => <Photo photo={PHOTOS.prague} {...props} />,
  },
  "strasbourg-christmas-market-2026": {
    Body: StrasbourgChristmasMarket2026,
    Hero: (props) => <Photo photo={PHOTOS.strasbourg} {...props} />,
  },
  "cheap-weekend-trips-from-milan-winter": {
    Body: CheapWeekendTripsFromMilanWinter,
    Hero: (props) => <Photo photo={PHOTOS.milan} {...props} />,
  },
};
