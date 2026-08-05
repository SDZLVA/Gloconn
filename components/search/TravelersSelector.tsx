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
 * Sprint 14.2 MVP: Rooms stepper is hidden (rooms remain 1 in form state / model).
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
      label="Travelers"
      fields={["adults", "children", "infants"]}
      includeRoomsInSummary={false}
      panelAriaLabel="Select travelers"
    />
  );
}
