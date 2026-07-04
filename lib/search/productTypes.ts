import {
  DEFAULT_SEARCH_PRODUCT_TYPES,
  type SearchProductType,
} from "@/types/models/search-request";

const VALID_PRODUCT_TYPES = new Set<SearchProductType>([
  "hotels",
  "flights",
  "transport",
]);

/** Parses a comma-separated productTypes query param. */
export function parseProductTypesParam(
  raw: string | null | undefined,
): SearchProductType[] {
  if (!raw?.trim()) {
    return [...DEFAULT_SEARCH_PRODUCT_TYPES];
  }

  const parsed = raw
    .split(",")
    .map((value) => value.trim())
    .filter((value): value is SearchProductType =>
      VALID_PRODUCT_TYPES.has(value as SearchProductType),
    );

  return parsed.length > 0 ? parsed : [...DEFAULT_SEARCH_PRODUCT_TYPES];
}

/** Serializes product types for URL query params. Omits when all defaults are selected. */
export function serializeProductTypesParam(
  types: SearchProductType[],
): string | null {
  const normalized = normalizeProductTypes(types);
  const isDefault =
    normalized.length === DEFAULT_SEARCH_PRODUCT_TYPES.length &&
    DEFAULT_SEARCH_PRODUCT_TYPES.every((type) => normalized.includes(type));

  return isDefault ? null : normalized.join(",");
}

/** Ensures at least one product type; falls back to all domains. */
export function normalizeProductTypes(
  types?: SearchProductType[],
): SearchProductType[] {
  if (!types || types.length === 0) {
    return [...DEFAULT_SEARCH_PRODUCT_TYPES];
  }

  return types.filter((type) => VALID_PRODUCT_TYPES.has(type));
}
