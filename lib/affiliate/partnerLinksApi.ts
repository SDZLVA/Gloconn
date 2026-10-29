/**
 * Travelpayouts link-creation API — server only (Milestone 19).
 *
 * Source: Travelpayouts Help Center, "API for Travelpayouts partner links"
 * (article 25289759198226): POST https://api.travelpayouts.com/links/v1/create
 * with trs (project ID), marker (partner ID) and up to 10 full-length brand
 * links; returns partner_url per link. 100 requests/minute per marker.
 * Not supported for Kiwi.com (Kiwi uses its own documented template).
 *
 * Every failure returns null: the caller then shows the plain brand link,
 * which still helps the traveller, just without commission. Results are
 * cached in memory because the same route and dates convert to the same
 * partner link, and the rate limit is per marker, not per visitor.
 */

import "server-only";

import { signalWithTimeout } from "@/lib/api/httpTimeout";

export const PARTNER_LINKS_API_URL = "https://api.travelpayouts.com/links/v1/create";
const TIMEOUT_MS = 3_000;
const CACHE_TTL_MS = 12 * 60 * 60 * 1000;
const MAX_CACHE_ENTRIES = 500;

type CacheEntry = { href: string; expires: number };
const cache = new Map<string, CacheEntry>();

export type PartnerLinkCredentials = {
  apiToken: string;
  projectId: string;
  marker: string;
};

type ApiLink = { url?: string; code?: string; partner_url?: string; message?: string };
type ApiResponse = { result?: { links?: ApiLink[] }; code?: string; status?: number };

function log(event: Record<string, unknown>): void {
  console.info(`[partner-links] ${JSON.stringify(event)}`);
}

/** Clears the cache. Tests only. */
export function _resetPartnerLinkCache(): void {
  cache.clear();
}

/**
 * Converts one brand link into a partner link. Returns null on any failure.
 * `subId` is a placement label (letters, digits, underscore) — never traveller data.
 */
export async function createPartnerLink(
  brandUrl: string,
  credentials: PartnerLinkCredentials,
  subId: string,
  fetchImpl: typeof fetch = fetch,
): Promise<string | null> {
  const { apiToken, projectId, marker } = credentials;
  if (!apiToken.trim() || !/^\d+$/.test(projectId) || !/^\d+$/.test(marker)) {
    return null;
  }

  const key = `${subId}|${brandUrl}`;
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) {
    return hit.href;
  }

  const started = Date.now();
  try {
    const response = await fetchImpl(PARTNER_LINKS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Access-Token": apiToken.trim(),
      },
      body: JSON.stringify({
        trs: Number(projectId),
        marker: Number(marker),
        shorten: false,
        links: [{ url: brandUrl }],
        sub_id: /^[A-Za-z0-9_]{1,64}$/.test(subId) ? subId : undefined,
      }),
      signal: signalWithTimeout(TIMEOUT_MS),
    });

    const body = (await response.json().catch(() => null)) as ApiResponse | null;
    const link = body?.result?.links?.[0];
    const href = link?.code === "success" ? link.partner_url : undefined;

    if (!response.ok || !href || !/^https:\/\//.test(href)) {
      log({ ok: false, httpStatus: response.status, code: link?.code ?? body?.code ?? null, ms: Date.now() - started });
      return null;
    }

    if (cache.size >= MAX_CACHE_ENTRIES) {
      cache.delete(cache.keys().next().value as string);
    }
    cache.set(key, { href, expires: Date.now() + CACHE_TTL_MS });
    log({ ok: true, httpStatus: response.status, ms: Date.now() - started });
    return href;
  } catch {
    log({ ok: false, error: "network_or_timeout", ms: Date.now() - started });
    return null;
  }
}
