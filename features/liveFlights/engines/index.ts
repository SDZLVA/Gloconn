import { TravelpayoutsWidgetPanel } from "@/features/liveFlights/engines/TravelpayoutsWidgetPanel";
import type { LiveFlightsEngine } from "@/features/liveFlights/types";

/** Every available engine. Add a new provider here. */
export const LIVE_FLIGHTS_ENGINES: readonly LiveFlightsEngine[] = [
  { id: "travelpayouts-widget", partnerName: "Aviasales", Panel: TravelpayoutsWidgetPanel },
];
