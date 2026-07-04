/**
 * Site navigation — single source of truth for page links.
 * Used by the navbar and footer so routes stay in sync.
 */

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/destinations", label: "Destinations" },
  { href: "/my-trips", label: "My Trips" },
  { href: "/about", label: "About" },
] as const;

type NavHref = (typeof NAV_LINKS)[number]["href"];

/** Pick nav links by href for footer sections. */
function pickNavLinks(...hrefs: NavHref[]) {
  return NAV_LINKS.filter((link) => hrefs.includes(link.href));
}

/** Footer columns built from the same links as the navbar. */
export const FOOTER_SECTIONS = [
  { title: "Explore", links: pickNavLinks("/destinations", "/my-trips") },
  { title: "Company", links: pickNavLinks("/about") },
] as const;
