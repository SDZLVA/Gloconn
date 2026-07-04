"use client";

import { DestinationAutocomplete } from "@/components/search/DestinationAutocomplete";
import type { PlaceSelection } from "@/types/search-form";

type OriginAutocompleteProps = {
  value: string;
  onChange: (value: string) => void;
  onOriginSelect?: (selection: PlaceSelection) => void;
  error?: string;
  required?: boolean;
  className?: string;
};

/**
 * OriginAutocomplete — departure city field for the search form.
 * Reuses the destination service and autocomplete UI (mock cities as origins).
 */
export function OriginAutocomplete({
  value,
  onChange,
  onOriginSelect,
  error,
  required = false,
  className,
}: OriginAutocompleteProps) {
  return (
    <DestinationAutocomplete
      id="search-origin"
      label="From"
      placeholder="Where are you leaving from?"
      value={value}
      onChange={onChange}
      onDestinationSelect={onOriginSelect}
      recentScope="origin"
      error={error}
      required={required}
      className={className}
    />
  );
}
