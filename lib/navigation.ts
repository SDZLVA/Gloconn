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

/** Legal pages — linked from the footer only. */
export const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Use" },
] as const;

/** One link in a footer column. */
export type FooterLink = { readonly href: string; readonly label: string };

/** One footer column. */
export type FooterSection = {
  readonly title: string;
  readonly links: readonly FooterLink[];
};

/** Footer columns built from the same links as the navbar, plus legal pages. */
export const FOOTER_SECTIONS: readonly FooterSection[] = [
  { title: "Explore", links: pickNavLinks("/my-trips") },
  { title: "Legal", links: LEGAL_LINKS },
];
