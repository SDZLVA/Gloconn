/**
 * TEMPORARY coverage probe (Milestone 22) — PREVIEW DEPLOYMENTS ONLY.
 *
 * Question: why do most routes return 0 tickets while MIL→PAR returns ~59?
 * On a preview, each real search also asks Aviasales a few variations and
 * logs how many tickets each returns ("[aviasales-probe] …"). No effect on
 * results. Remove once the fix is chosen.
 */

import type { AviasalesPricesForDatesResponse } from "@/lib/providers/flights/aviasales/types";

type Fetch = (params: URLSearchParams, token: string) => Promise<AviasalesPricesForDatesResponse>;

export function coverageProbeEnabled(): boolean {
  return process.env.VERCEL_ENV === "preview";
}

function variants(base: URLSearchParams, airports: { origin?: string; destination?: string }) {
  const out: Array<[string, URLSearchParams]> = [];
  const make = (name: string, edit: (p: URLSearchParams) => void) => {
    const p = new URLSearchParams(base);
    edit(p);
    out.push([name, p]);
  };
  const dep = base.get("departure_at") ?? "";
  const ret = base.get("return_at");

  make("rt_month", (p) => {
    p.set("departure_at", dep.slice(0, 7));
    if (ret) p.set("return_at", ret.slice(0, 7));
    p.set("limit", "1000");
  });
  make("rt_dep_only", (p) => {
    p.delete("return_at");
    p.set("one_way", "false");
    p.set("limit", "1000");
  });
  make("ow_out_day", (p) => {
    p.delete("return_at");
    p.set("one_way", "true");
    p.set("limit", "1000");
  });
  make("ow_out_month", (p) => {
    p.delete("return_at");
    p.set("one_way", "true");
    p.set("departure_at", dep.slice(0, 7));
    p.set("limit", "1000");
  });
  for (const market of ["us", "it", "gb", "de", "fr", "es"]) {
    make(`rt_market_${market}`, (p) => p.set("market", market));
  }
  if (airports.origin && airports.destination) {
    make("rt_airports", (p) => {
      p.set("origin", airports.origin as string);
      p.set("destination", airports.destination as string);
    });
  }
  return out;
}

export async function runCoverageProbe(
  base: URLSearchParams,
  token: string,
  fetchPrices: Fetch,
  airports: { origin?: string; destination?: string },
): Promise<void> {
  const route = `${base.get("origin")}-${base.get("destination")} ${base.get("departure_at")}/${base.get("return_at") ?? "ow"}`;
  const dep = base.get("departure_at");
  const ret = base.get("return_at");
  await Promise.all(
    variants(base, airports).map(async ([variant, params]) => {
      try {
        const res = await fetchPrices(params, token);
        const data = res.data ?? [];
        const exact = data.filter(
          (t) => t.departure_at?.startsWith(dep ?? "-") && (!ret || t.return_at?.startsWith(ret)),
        ).length;
        const days = [...new Set(data.map((t) => t.departure_at?.slice(5, 10)))].slice(0, 12);
        console.info(
          `[aviasales-probe] ${JSON.stringify({ route, variant, tickets: data.length, exactDates: exact, days })}`,
        );
      } catch (error) {
        console.info(`[aviasales-probe] ${JSON.stringify({ route, variant, error: String(error).slice(0, 120) })}`);
      }
    }),
  );
}
