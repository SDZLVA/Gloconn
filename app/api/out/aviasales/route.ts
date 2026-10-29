/**
 * GET /api/out/aviasales?u=<aviasales.com ticket URL> — Milestone 20.
 *
 * Sends the traveller to the exact ticket on aviasales.com, through a
 * Travelpayouts partner link when one can be made. See
 * lib/affiliate/aviasalesRedirect.ts. /api/ is disallowed in robots.txt,
 * and every response says noindex, so crawlers do not spend the
 * partner-link quota.
 */

import { resolveAviasalesRedirect } from "@/lib/affiliate/aviasalesRedirect";
import { checkRateLimitCustom, getClientIp } from "@/lib/api/rateLimit";

const NO_INDEX = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" };

export async function GET(request: Request) {
  const target = new URL(request.url).searchParams.get("u");

  // A person clicks a few tickets; a script clicks hundreds.
  const rate = checkRateLimitCustom(getClientIp(request), 30, 300, "out-aviasales");
  if (!rate.allowed) {
    return new Response("Too many requests. Please wait a minute and try again.", {
      status: 429,
      headers: { ...NO_INDEX, "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const result = await resolveAviasalesRedirect(target);
  if (!result.ok) {
    return new Response("This flight link is not valid.", {
      status: 400,
      headers: { ...NO_INDEX, "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  return new Response(null, {
    status: 302,
    headers: { ...NO_INDEX, Location: result.location, "Referrer-Policy": "no-referrer" },
  });
}
