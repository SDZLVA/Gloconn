"use client";

import { PassengersSelector } from "@/components/ui/PassengersSelector";
import type { PassengersState } from "@/types/search";

type TravelersSelectorProps = {
  value: PassengersState;
  onChange: (value: PassengersState) => void;
  error?: string;
  required?: boolean;
  className?: string;
};

/**
 * TravelersSelector — search-form wrapper around the reusable PassengersSelector.
 * Uses the "Travelers & rooms" label expected on the home page search card.
 */
export function TravelersSelector({
  value,
  onChange,
  error,
  required = false,
  className,
}: TravelersSelectorProps) {
  return (
    <PassengersSelector
      value={value}
      onChange={onChange}
      error={error}
      required={required}
      className={className}
      label="Travelers & rooms"
      panelAriaLabel="Select travelers and rooms"
    />
  );
}
