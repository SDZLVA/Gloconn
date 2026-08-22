/**
 * Sprint 17.4 / 17.5.1 — Hotel property-ref & details-cache deployment notes
 *
 * ## Solved (17.5.1): reference reliability
 *
 * Search attaches a sealed `providerPropertyRef` (`gpref1.…`) using AES-256-GCM.
 * Details (`GET /api/hotels/details?ref=…`) unseals the reference with
 * `PROPERTY_REF_SEAL_SECRET`. No shared process memory is required for the
 * property-token lookup. Cross-isolate / multi-instance hosts work as long as
 * they share the same seal secret.
 *
 * ## Remaining limitation: details response cache
 *
 * Mapped property-details payloads remain in an **in-process** cache (15 min TTL).
 * That only avoids repeat SerpAPI calls on the same isolate. A miss on another
 * isolate re-fetches details (paid) but still succeeds when `ref` is valid.
 *
 * ## Do not use for production token lookup
 *
 * `propertyTokenRegistry` is test/dev only. The SerpAPI hotels mapper no longer
 * registers raw tokens into process memory.
 */
