/**
 * Milestone 63c/64 — blog photos (Unsplash, free under the Unsplash License)
 * and their CDN URLs. Shared by the blog and the home page "Travel ideas".
 */

export type BlogPhoto = {
  /** "photo-1610016302534-6f67f1c968d8" */
  id: string;
  alt: string;
  by: string;
  /** The photo's Unsplash page, for the credit link. */
  page: string;
};

/** Unsplash CDN link, cropped to w × h (the CDN resizes on the fly). */
export function photoUrl(id: string, w: number, h: number = Math.round((w * 9) / 16)): string {
  return `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&auto=format&q=75`;
}

const U = "https://unsplash.com/photos/";

/** Photos used on the blog (all checked: "Free to use under the Unsplash License", 2026-11-18). */
export const PHOTOS = {
  milan: { id: "photo-1610016302534-6f67f1c968d8", alt: "Milan Cathedral (Duomo di Milano) at sunset", by: "Ouael Ben Salah", page: `${U}0xe2FGo7Vc0` },
  budapest: { id: "photo-1698657792682-48f73d9d0b8c", alt: "The Hungarian Parliament in Budapest lit up at night on the Danube", by: "Leonhard Niederwimmer", page: `${U}KiUE0O5pVeI` },
  krakow: { id: "photo-1697821830112-665545013660", alt: "Kraków Main Market Square with the Cloth Hall", by: "Tomasz Anusiewicz", page: `${U}tT_lGiR7udY` },
  lisbon: { id: "photo-1590941761838-60179f0ed248", alt: "A yellow tram 28 in Lisbon", by: "Paulo Evangelista", page: `${U}2N0PVuB0byQ` },
  seville: { id: "photo-1605086944102-56c678d51c9a", alt: "Seville Cathedral and the Giralda tower at night", by: "Tom Podmore", page: `${U}2cEdlKdGEq4` },
  athens: { id: "photo-1603565816030-6b389eeb23cb", alt: "The Acropolis of Athens at golden hour", by: "Constantinos Kollias", page: `${U}yqBvJJ8jGBQ` },
} satisfies Record<string, BlogPhoto>;

export type PhotoKey = keyof typeof PHOTOS;
