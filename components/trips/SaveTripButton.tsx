"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { saveTripAction } from "@/lib/trips/actions";
import { buildSearchData } from "@/lib/search/payload";
import type { SearchData } from "@/types/search";

type SaveTripButtonProps = {
  search: Partial<SearchData>;
};

function isCompleteSearch(search: Partial<SearchData>): search is SearchData {
  return Boolean(
    search.destination &&
      search.departureDate &&
      search.travelers &&
      search.travelStyle &&
      search.tripType,
  );
}

/** Saves the current search to the user's account (redirects to login if needed). */
export function SaveTripButton({ search }: SaveTripButtonProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isCompleteSearch(search)) {
    return null;
  }

  function handleSave() {
    if (!isCompleteSearch(search)) {
      return;
    }

    setMessage(null);
    const searchData = buildSearchData({
      destination: search.destination,
      tripType: search.tripType,
      departureDate: search.departureDate,
      returnDate: search.returnDate ?? "",
      budget: search.budget !== null ? String(search.budget) : "",
      budgetCurrency: search.budgetCurrency ?? "EUR",
      travelers: search.travelers,
      travelStyle: search.travelStyle,
    });

    startTransition(async () => {
      const result = await saveTripAction(searchData, "/search/results");

      if (result.success) {
        setMessage(result.message);
        router.refresh();
        return;
      }

      setMessage(result.message);
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        type="button"
        variant="secondary"
        disabled={isPending}
        onClick={handleSave}
      >
        {isPending ? "Saving…" : "Save trip"}
      </Button>
      {message && (
        <p className="text-xs font-medium text-emerald-700">{message}</p>
      )}
    </div>
  );
}
