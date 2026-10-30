import { LIVE_FLIGHTS_ENGINES } from "@/features/liveFlights/engines";
import type { LiveFlightsEngine } from "@/features/liveFlights/types";

export const DEFAULT_LIVE_FLIGHTS_ENGINE = "travelpayouts-widget";

/** Pure: engine for a setting value. "off" (or anything unknown) → none. */
export function selectLiveFlightsEngine(
  setting: string | undefined,
  engines: readonly LiveFlightsEngine[] = LIVE_FLIGHTS_ENGINES,
): LiveFlightsEngine | null {
  const id = (setting ?? "").trim() || DEFAULT_LIVE_FLIGHTS_ENGINE;
  return engines.find((engine) => engine.id === id) ?? null;
}

/** The engine chosen by NEXT_PUBLIC_LIVE_FLIGHTS_ENGINE (build time). */
export function activeLiveFlightsEngine(): LiveFlightsEngine | null {
  // Literal reference so Next.js inlines it.
  return selectLiveFlightsEngine(process.env.NEXT_PUBLIC_LIVE_FLIGHTS_ENGINE);
}
