"use client";

import { useMemo } from "react";
import { Autocomplete } from "@/components/ui/Autocomplete";
import {
  filterDestinations,
  formatDestinationLabel,
} from "@/lib/destinations";

type DestinationAutocompleteProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  className?: string;
};

/**
 * DestinationAutocomplete — destination field with mock-data suggestions.
 * Wraps the generic Autocomplete with Glooconn destination data (no API).
 */
export function DestinationAutocomplete({
  id = "search-destination",
  value,
  onChange,
  error,
  required = false,
  className,
}: DestinationAutocompleteProps) {
  const options = useMemo(() => {
    return filterDestinations(value).map((destination) => ({
      id: destination.id,
      label: formatDestinationLabel(destination),
      description: destination.region,
    }));
  }, [value]);

  return (
    <Autocomplete
      id={id}
      label="Destination"
      placeholder="Where do you want to go?"
      value={value}
      options={options}
      onChange={onChange}
      error={error}
      required={required}
      noResultsMessage="No destinations match your search."
      className={className}
    />
  );
}
