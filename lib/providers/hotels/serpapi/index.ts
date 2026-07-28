/**
 * SerpAPI hotels adapter — public package surface.
 *
 * Factory imports the singleton from this barrel.
 * Query builder, HTTP client, mappers, and raw types stay package-private.
 */

export {
  SerpApiHotelsProvider,
  serpApiHotelsProvider,
} from "@/lib/providers/hotels/serpapi/provider";
