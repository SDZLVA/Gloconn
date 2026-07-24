/**
 * POST /api/search — runs a validated trip search via the service layer.
 * Body: partial or full SearchRequest JSON.
 * Success data: SearchResponse (domain arrays + optional warnings).
 */

import { toErrorJsonResponse, toJsonResponse } from "@/lib/api/responses";
import { searchTrips } from "@/lib/services/searchService";
import type { SearchRequest } from "@/types/models/search-request";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<SearchRequest>;
    const result = await searchTrips(body);
    return toJsonResponse(result);
  } catch {
    return toErrorJsonResponse(null, "Invalid search request body.");
  }
}
