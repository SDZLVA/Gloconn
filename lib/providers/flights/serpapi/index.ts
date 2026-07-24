/**
 * SerpAPI flights adapter — public package surface (ADR-036).
 *
 * Factory imports the singleton from this barrel.
 * Query builder, HTTP client, mappers, and raw types stay package-private.
 */

export {
  SerpApiFlightsProvider,
  serpApiFlightsProvider,
} from "@/lib/providers/flights/serpapi/provider";
