/**
 * Legal page constants — one place to change contact details and dates.
 *
 * NOTE: these documents are plain-language drafts written for a pre-launch
 * product. Have a lawyer review them before Glooconn accepts real users,
 * takes payments, or joins an affiliate programme.
 */

/** Public contact address shown on the legal pages. */
export const LEGAL_CONTACT_EMAIL = "privacy@glooconn.com";

/** Date these documents last changed (ISO). Update when you edit them. */
export const LEGAL_LAST_UPDATED = "2026-10-27";

/** Human-readable version of LEGAL_LAST_UPDATED. */
export function formatLegalDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
