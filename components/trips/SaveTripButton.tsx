"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { saveTripAction } from "@/lib/trips/actions";
import { searchRequestToSearchData } from "@/lib/search/request";
import type { SearchRequest } from "@/types/models/search-request";

type SaveTripButtonProps = {
  search: Partial<SearchRequest>;
};

function isCompleteSearch(
  search: Partial<SearchRequest>,
): search is SearchRequest {
  return Boolean(
    search.destination &&
      search.departureDate &&
      search.travelers &&
      search.travelStyle &&
      search.tripType &&
      search.origin &&
      search.budget,
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
    const searchData = searchRequestToSearchData(search);

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
