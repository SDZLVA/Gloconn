/**
 * Site navigation — single source of truth for page links.
 * Used by the navbar and footer so routes stay in sync.
 *
 * Sprint 14.2 MVP: unfinished Destinations / About links are omitted from the UI.
 * Routes may still exist later — do not delete architecture for those pages here.
 */

export const NAV_LINKS = [
  { href: "/", label: "Search" },
  { href: "/my-trips", label: "My Trips" },
] as const;

type NavHref = (typeof NAV_LINKS)[number]["href"];

/** Pick nav links by href for footer sections. */
function pickNavLinks(...hrefs: NavHref[]) {
  return NAV_LINKS.filter((link) => hrefs.includes(link.href));
}

/** Footer columns built from the same links as the navbar. */
export const FOOTER_SECTIONS = [
  { title: "Explore", links: pickNavLinks("/my-trips") },
] as const;
