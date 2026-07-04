import type { TravelersState } from "@/types/search";

/** Minimum and maximum allowed values for each travelers field. */
export const TRAVELERS_LIMITS = {
  adults: { min: 1, max: 9 },
  children: { min: 0, max: 9 },
  infants: { min: 0, max: 4 },
  rooms: { min: 1, max: 9 },
} as const;

/** Labels and helper text for the travelers selector rows. */
export const TRAVELERS_FIELD_CONFIG = [
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
export function getTotalGuests(travelers: TravelersState): number {
  return travelers.adults + travelers.children + travelers.infants;
}

/** Builds a readable summary for the travelers trigger button. */
export function formatTravelersSummary(travelers: TravelersState): string {
  const parts: string[] = [];

  parts.push(
    travelers.adults === 1 ? "1 Adult" : `${travelers.adults} Adults`,
  );

  if (travelers.children > 0) {
    parts.push(
      travelers.children === 1
        ? "1 Child"
        : `${travelers.children} Children`,
    );
  }

  if (travelers.infants > 0) {
    parts.push(
      travelers.infants === 1 ? "1 Infant" : `${travelers.infants} Infants`,
    );
  }

  parts.push(
    travelers.rooms === 1 ? "1 Room" : `${travelers.rooms} Rooms`,
  );

  return parts.join(" · ");
}
