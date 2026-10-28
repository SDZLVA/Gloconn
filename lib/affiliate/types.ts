/**
 * Affiliate link tagging — types (Milestone 19).
 *
 * Glooconn earns commission when a traveller continues to a partner and
 * books. Tagging happens at the moment a link is rendered, never during
 * ranking: see PROJECT_PRINCIPLES.md and the commission-disclosure section
 * of /terms. Commission must never reorder results.
 */

/** Networks Glooconn can tag outbound links for. */
export type AffiliateProgram = "travelpayouts";

export type AffiliateConfig = {
  /** True only when at least one programme has a usable marker. */
  enabled: boolean;
  /**
   * Travelpayouts partner marker.
   *
   * Not a secret: it travels in the outbound URL and is visible to anyone
   * who inspects the link. It is still read from the environment so it can
   * differ between preview and production.
   */
  travelpayoutsMarker: string | null;
};

/** Why a link was left untagged. Useful in logs; never shown to users. */
export type TagSkipReason =
  | "disabled"
  | "invalid_url"
  | "unsupported_host"
  | "already_tagged";

export type TagResult = {
  /** Where to send the traveller. Never empty — falls back to the input. */
  url: string;
  /** True when a tracking parameter was added. */
  tagged: boolean;
  /** Present only when `tagged` is false. */
  reason?: TagSkipReason;
};
