import { BusResultCard } from "@/components/results/BusResultCard";
import { FlightResultCard } from "@/components/results/FlightResultCard";
import { HotelResultCard } from "@/components/results/HotelResultCard";
import { TrainResultCard } from "@/components/results/TrainResultCard";
import type { SearchResult } from "@/types/results";

type ResultCardProps = {
  result: SearchResult;
};

/** Dispatches to the correct card component based on result type. */
export function ResultCard({ result }: ResultCardProps) {
  switch (result.type) {
    case "hotel":
      return <HotelResultCard result={result} />;
    case "flight":
      return <FlightResultCard result={result} />;
    case "bus":
      return <BusResultCard result={result} />;
    case "train":
      return <TrainResultCard result={result} />;
  }
}
