import type { CityCode } from "@/lib/routes/catalog";
import type { FaqItem } from "@/lib/seo/jsonld";

/** Milestone 78 — the 7 continents shown on /destinations, in display order. */
export const REGIONS = [
  { id: "africa", name: "Africa" },
  { id: "asia", name: "Asia" },
  { id: "europe", name: "Europe" },
  { id: "north-america", name: "North America" },
  { id: "south-america", name: "South America" },
  { id: "oceania", name: "Oceania" },
  { id: "antarctica", name: "Antarctica" },
] as const;

export type RegionId = (typeof REGIONS)[number]["id"];

export type Attraction = { name: string; text: string };

export type Destination = {
  slug: string;
  /** Region on /destinations. */
  region: RegionId;
  /**
   * Position inside the region (1 = most visited). The hub shows the 5 best-ranked per region as
   * "Top 5"; the rest follow under "More in <region>". Add new hot places with the next free rank.
   */
  rank: number;
  /** YYYY-MM-DD the destination was first added (shows a "New" badge for 30 days). */
  added: string;
  /** City (or, for Antarctica, the gateway city) used for the flight and hotel search. */
  cityCode: CityCode;
  /** Antarctica only: shown as a note because there are no scheduled passenger flights there. */
  gatewayNote?: string;
  /** Name shown on cards and in headings. */
  name: string;
  country: string;
  /** Key into PHOTOS (lib/blog/photos.ts) or DEST_PHOTOS (lib/destinations/photos.ts). */
  photo: string;
  /** One line on the card. */
  tagline: string;
  /** Months (1–12) when the place is at its best — drives the monthly order on the home page. */
  bestMonths: readonly number[];
  title: string;
  /** ≤160 characters. */
  description: string;
  intro: string[];
  attractions: Attraction[];
  /** "When to go" paragraphs. */
  bestTime: string[];
  tips: string[];
  faq: FaqItem[];
  /** YYYY-MM-DD the facts were last checked. */
  checked: string;
};
