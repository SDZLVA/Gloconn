"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { deleteTripAction } from "@/lib/trips/actions";
import { formatSavedTripDate } from "@/lib/trips/format";
import { searchDataToParams } from "@/lib/search";
import { formatPassengersSummary } from "@/lib/search/passengers";
import type { SavedTrip } from "@/types/trips";

type SavedTripsListProps = {
  trips: SavedTrip[];
};

/** Renders saved trips or an empty state when none exist. */
export function SavedTripsList({ trips }: SavedTripsListProps) {
  if (trips.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-lg font-semibold text-slate-900">No trips saved yet</p>
        <p className="mt-2 text-sm text-slate-600">
          Search for a destination, then use <strong>Save trip</strong> on the
          results page.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-brand-700 px-6 py-3 text-sm font-semibold text-white motion-safe:hover:bg-brand-800"
        >
          Start searching
        </Link>
      </Card>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {trips.map((trip) => (
        <li key={trip.id}>
          <SavedTripCard trip={trip} />
        </li>
      ))}
    </ul>
  );
}

function SavedTripCard({ trip }: { trip: SavedTrip }) {
  const [isPending, startTransition] = useTransition();
  const { searchData } = trip;
  const resultsUrl = `/search/results?${searchDataToParams(searchData).toString()}`;
  const travelers = formatPassengersSummary(searchData.travelers);

  function handleDelete() {
    startTransition(async () => {
      await deleteTripAction(trip.id);
    });
  }

  return (
    <Card hoverable className="flex h-full flex-col p-5">
      <div className="flex-1 space-y-2">
        <p className="text-lg font-bold text-slate-900">{trip.title}</p>
        <p className="text-sm text-slate-600">
          {travelers} · Saved {formatSavedTripDate(trip.createdAt)}
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href={resultsUrl}
          className="inline-flex flex-1 items-center justify-center rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white motion-safe:hover:bg-brand-800"
        >
          View results
        </Link>
        <Button
          type="button"
          variant="secondary"
          className="px-4 py-2.5"
          disabled={isPending}
          onClick={handleDelete}
        >
          {isPending ? "Removing…" : "Remove"}
        </Button>
      </div>
    </Card>
  );
}
