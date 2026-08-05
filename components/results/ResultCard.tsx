import { memo } from "react";
import { BusResultCard } from "@/components/results/BusResultCard";
import { FlightResultCard } from "@/components/results/FlightResultCard";
import { HotelResultCard } from "@/components/results/HotelResultCard";
import { TrainResultCard } from "@/components/results/TrainResultCard";
import type { TripType } from "@/types/models/search-request";
import type { SearchResult } from "@/types/results";

type ResultCardProps = {
  result: SearchResult;
  /** Used for flight trip-type wording (Sprint 14.3). */
  tripType?: TripType;
};

/** Dispatches to the correct card component based on result type. */
function ResultCardComponent({ result, tripType }: ResultCardProps) {
  switch (result.type) {
    case "hotel":
      return <HotelResultCard result={result} />;
    case "flight":
      return <FlightResultCard result={result} tripType={tripType} />;
    case "bus":
      return <BusResultCard result={result} />;
    case "train":
      return <TrainResultCard result={result} />;
  }
}

/**
 * Memoized so filter/sort/sidebar churn does not re-render unchanged cards.
 * Identity is by `result` reference (stable after filter/sort for unchanged items).
 */
export const ResultCard = memo(ResultCardComponent);
