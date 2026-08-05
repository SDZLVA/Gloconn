import type { PassengersState } from "@/types/search";

/** Minimum and maximum allowed values for each passengers field. */
export const PASSENGERS_LIMITS = {
  adults: { min: 1, max: 9 },
  children: { min: 0, max: 9 },
  infants: { min: 0, max: 4 },
  rooms: { min: 1, max: 9 },
} as const;

export type PassengerField = keyof PassengersState;

/** Labels and helper text for the passengers selector rows. */
export const PASSENGERS_FIELD_CONFIG = [
  {
    key: "adults" as const,
    label: "Adults",
    description: "Ages 13 or above",
  },
  {
    key: "children" as const,
    label: "Children",
    description: "Ages 2–12",
  },
  {
    key: "infants" as const,
    label: "Infants",
    description: "Under 2",
  },
  {
    key: "rooms" as const,
    label: "Rooms",
    description: "How many rooms you need",
  },
] as const;

/** Total guests (adults + children + infants). Infants do not count toward room capacity in this mock. */
export function getTotalPassengers(passengers: PassengersState): number {
  return passengers.adults + passengers.children + passengers.infants;
}

/** Builds a readable summary for the passengers trigger button. */
export function formatPassengersSummary(
  passengers: PassengersState,
  options: { includeRooms?: boolean } = {},
): string {
  const includeRooms = options.includeRooms ?? true;
  const parts: string[] = [];

  parts.push(
    passengers.adults === 1 ? "1 Adult" : `${passengers.adults} Adults`,
  );

  if (passengers.children > 0) {
    parts.push(
      passengers.children === 1
        ? "1 Child"
        : `${passengers.children} Children`,
    );
  }

  if (passengers.infants > 0) {
    parts.push(
      passengers.infants === 1 ? "1 Infant" : `${passengers.infants} Infants`,
    );
  }

  if (includeRooms) {
    parts.push(
      passengers.rooms === 1 ? "1 Room" : `${passengers.rooms} Rooms`,
    );
  }

  return parts.join(" · ");
}

/**
 * Validates passenger counts.
 * Returns an error message when invalid, or undefined when valid.
 */
export function validatePassengers(passengers: PassengersState): string | undefined {
  const { adults, children, infants, rooms } = passengers;

  if (adults < PASSENGERS_LIMITS.adults.min) {
    return "At least 1 adult is required.";
  }

  if (adults > PASSENGERS_LIMITS.adults.max) {
    return `Maximum ${PASSENGERS_LIMITS.adults.max} adults.`;
  }

  if (children > PASSENGERS_LIMITS.children.max) {
    return `Maximum ${PASSENGERS_LIMITS.children.max} children.`;
  }

  if (infants > PASSENGERS_LIMITS.infants.max) {
    return `Maximum ${PASSENGERS_LIMITS.infants.max} infants.`;
  }

  if (rooms < PASSENGERS_LIMITS.rooms.min) {
    return "At least 1 room is required.";
  }

  if (rooms > PASSENGERS_LIMITS.rooms.max) {
    return `Maximum ${PASSENGERS_LIMITS.rooms.max} rooms.`;
  }

  if (infants > adults) {
    return "Each infant must be accompanied by an adult.";
  }

  return undefined;
}

/**
 * Applies a field update while keeping infants within the adult count.
 * Used by the selector to prevent invalid combinations during stepper use.
 */
export function applyPassengerFieldUpdate<K extends PassengerField>(
  current: PassengersState,
  field: K,
  nextValue: PassengersState[K],
): PassengersState {
  const next = { ...current, [field]: nextValue };

  if (field === "adults" && next.infants > next.adults) {
    next.infants = next.adults;
  }

  return next;
}

/** Effective max for infants — cannot exceed the number of adults. */
export function getInfantMax(passengers: PassengersState): number {
  return Math.min(PASSENGERS_LIMITS.infants.max, passengers.adults);
}
