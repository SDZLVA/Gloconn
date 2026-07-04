"use client";

import { DestinationAutocomplete } from "@/components/search/DestinationAutocomplete";
import type { PlaceSelection } from "@/types/search-form";

type OriginAutocompleteProps = {
  value: string;
  onChange: (value: string) => void;
  onOriginSelect?: (selection: PlaceSelection) => void;
  error?: string;
  className?: string;
};

/**
 * OriginAutocomplete — optional departure city field for flights and transport.
 * Reuses the destination service and autocomplete UI (mock cities as origins).
 */
export function OriginAutocomplete({
  value,
  onChange,
  onOriginSelect,
  error,
  className,
}: OriginAutocompleteProps) {
  return (
    <DestinationAutocomplete
      id="search-origin"
      label="From"
      placeholder="Where are you leaving from? (optional)"
      value={value}
      onChange={onChange}
      onDestinationSelect={onOriginSelect}
      error={error}
      className={className}
    />
  );
}
