"use client";

import { useEffect, useRef, useState } from "react";
import { focusRing, formLabel } from "@/lib/styles";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type {
  ResultType,
  ResultsFilterFacets,
  ResultsFilters,
} from "@/types/results";
import { DEFAULT_RESULTS_FILTERS, RESULT_TYPE_LABELS } from "@/types/results";
import { MVP_RESULT_TYPES } from "@/lib/results/mvpUi";

/** Debounce price commits so filter/sort/rank do not run on every keystroke. */
const PRICE_FILTER_DEBOUNCE_MS = 200;

/** Sprint 14.2 MVP — hotel + flight only (bus/train filters hidden). */
const FILTERABLE_TYPES = MVP_RESULT_TYPES;

const RATING_OPTIONS = [
  { value: 0, label: "Any rating" },
  { value: 3, label: "3.0+" },
  { value: 4, label: "4.0+" },
  { value: 4.5, label: "4.5+" },
];

const STAR_OPTIONS = [
  { value: 0, label: "Any stars" },
  { value: 3, label: "3+ stars" },
  { value: 4, label: "4+ stars" },
  { value: 5, label: "5 stars" },
];

const STOP_OPTIONS = [
  { value: null as number | null, label: "Any stops" },
  { value: 0, label: "Non-stop only" },
  { value: 1, label: "1 stop or fewer" },
  { value: 2, label: "2 stops or fewer" },
];

type ResultsFilterSidebarProps = {
  filters: ResultsFilters;
  onFiltersChange: (filters: ResultsFilters) => void;
  priceRange: { min: number; max: number };
  /** Facets derived from the current result set. */
  facets: ResultsFilterFacets;
  className?: string;
};

function toggleStringValue(values: string[], value: string): string[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

/** Sidebar with type, price, rating, and model-backed quality filters. */
export function ResultsFilterSidebar({
  filters,
  onFiltersChange,
  priceRange,
  facets,
  className,
}: ResultsFilterSidebarProps) {
  // Local price draft — UI stays responsive; parent filters update after debounce.
  const [draftMinPrice, setDraftMinPrice] = useState(filters.minPrice);
  const [draftMaxPrice, setDraftMaxPrice] = useState(filters.maxPrice);
  const filtersRef = useRef(filters);

  // Keep latest filters for the debounced commit without reading refs during render.
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  // Sync draft when parent resets filters (clear all / new search baseline).
  useEffect(() => {
    setDraftMinPrice(filters.minPrice);
    setDraftMaxPrice(filters.maxPrice);
  }, [filters.minPrice, filters.maxPrice]);

  useEffect(() => {
    if (
      draftMinPrice === filtersRef.current.minPrice &&
      draftMaxPrice === filtersRef.current.maxPrice
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      onFiltersChange({
        ...filtersRef.current,
        minPrice: draftMinPrice,
        maxPrice: draftMaxPrice,
      });
    }, PRICE_FILTER_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [draftMinPrice, draftMaxPrice, onFiltersChange]);

  function toggleType(type: ResultType) {
    const types = filters.types.includes(type)
      ? filters.types.filter((item) => item !== type)
      : [...filters.types, type];

    onFiltersChange({
      ...filters,
      types: types.length > 0 ? types : [type],
    });
  }

  function clearFilters() {
    onFiltersChange({
      ...DEFAULT_RESULTS_FILTERS,
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
    });
  }

  const showFlightFilters =
    filters.types.includes("flight") &&
    (facets.airlines.length > 0 ||
      facets.cabins.length > 0 ||
      facets.maxStopsInResults >= 0);

  const showHotelStars = filters.types.includes("hotel");

  // Sprint 14.2 MVP: hotel amenities only (bus amenities / operators hidden).
  const showAmenities =
    filters.types.includes("hotel") && facets.amenities.length > 0;

  return (
    <Card className={cn("p-4 sm:p-5", className)}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-bold text-slate-900">Filters</h2>
        <button
          type="button"
          onClick={clearFilters}
          className={cn(
            "text-xs font-semibold text-brand-700 underline-offset-2 hover:underline",
            focusRing,
          )}
        >
          Clear all
        </button>
      </div>

      <div className="mt-5 space-y-6">
        <fieldset>
          <legend className={formLabel}>Result type</legend>
          <ul className="mt-3 space-y-2">
            {FILTERABLE_TYPES.map((type) => (
              <li key={type}>
                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={filters.types.includes(type)}
                    onChange={() => toggleType(type)}
                    className={cn(
                      "h-4 w-4 rounded border-slate-300 text-brand-700",
                      focusRing,
                    )}
                  />
                  {RESULT_TYPE_LABELS[type]}
                </label>
              </li>
            ))}
          </ul>
        </fieldset>

        <div>
          <label htmlFor="min-price" className={formLabel}>
            Price range
          </label>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="min-price" className="sr-only">
                Minimum price
              </label>
              <input
                id="min-price"
                type="number"
                min={priceRange.min}
                max={draftMaxPrice}
                value={draftMinPrice}
                onChange={(event) =>
                  setDraftMinPrice(Number(event.target.value))
                }
                className={cn(
                  "w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800",
                  focusRing,
                )}
              />
            </div>
            <div>
              <label htmlFor="max-price" className="sr-only">
                Maximum price
              </label>
              <input
                id="max-price"
                type="number"
                min={draftMinPrice}
                max={priceRange.max}
                value={draftMaxPrice}
                onChange={(event) =>
                  setDraftMaxPrice(Number(event.target.value))
                }
                className={cn(
                  "w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800",
                  focusRing,
                )}
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="min-rating" className={formLabel}>
            Minimum rating
          </label>
          <select
            id="min-rating"
            value={filters.minRating}
            onChange={(event) =>
              onFiltersChange({
                ...filters,
                minRating: Number(event.target.value),
              })
            }
            className={cn(
              "mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800",
              focusRing,
            )}
          >
            {RATING_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {showFlightFilters && (
          <>
            <div>
              <label htmlFor="max-stops" className={formLabel}>
                Flight stops
              </label>
              <select
                id="max-stops"
                value={filters.maxStops === null ? "" : String(filters.maxStops)}
                onChange={(event) => {
                  const raw = event.target.value;
                  onFiltersChange({
                    ...filters,
                    maxStops: raw === "" ? null : Number(raw),
                  });
                }}
                className={cn(
                  "mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800",
                  focusRing,
                )}
              >
                {STOP_OPTIONS.map((option) => (
                  <option
                    key={String(option.value)}
                    value={option.value === null ? "" : String(option.value)}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {facets.cabins.length > 0 && (
              <fieldset>
                <legend className={formLabel}>Cabin class</legend>
                <ul className="mt-3 max-h-40 space-y-2 overflow-y-auto pr-1">
                  {facets.cabins.map((cabin) => (
                    <li key={cabin}>
                      <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={filters.cabins.includes(cabin)}
                          onChange={() =>
                            onFiltersChange({
                              ...filters,
                              cabins: toggleStringValue(filters.cabins, cabin),
                            })
                          }
                          className={cn(
                            "h-4 w-4 rounded border-slate-300 text-brand-700",
                            focusRing,
                          )}
                        />
                        {cabin}
                      </label>
                    </li>
                  ))}
                </ul>
              </fieldset>
            )}

            {facets.airlines.length > 0 && (
              <fieldset>
                <legend className={formLabel}>Airlines</legend>
                <ul className="mt-3 max-h-40 space-y-2 overflow-y-auto pr-1">
                  {facets.airlines.map((airline) => (
                    <li key={airline}>
                      <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={filters.airlines.includes(airline)}
                          onChange={() =>
                            onFiltersChange({
                              ...filters,
                              airlines: toggleStringValue(
                                filters.airlines,
                                airline,
                              ),
                            })
                          }
                          className={cn(
                            "h-4 w-4 rounded border-slate-300 text-brand-700",
                            focusRing,
                          )}
                        />
                        {airline}
                      </label>
                    </li>
                  ))}
                </ul>
              </fieldset>
            )}
          </>
        )}

        {showHotelStars && (
          <div>
            <label htmlFor="min-stars" className={formLabel}>
              Hotel stars
            </label>
            <select
              id="min-stars"
              value={filters.minStars}
              onChange={(event) =>
                onFiltersChange({
                  ...filters,
                  minStars: Number(event.target.value),
                })
              }
              className={cn(
                "mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800",
                focusRing,
              )}
            >
              {STAR_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {showAmenities && (
          <fieldset>
            <legend className={formLabel}>Amenities</legend>
            <p className="mt-1 text-xs text-slate-500">
              Results must include every selected amenity.
            </p>
            <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto pr-1">
              {facets.amenities.map((amenity) => (
                <li key={amenity}>
                  <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={filters.amenities.includes(amenity)}
                      onChange={() =>
                        onFiltersChange({
                          ...filters,
                          amenities: toggleStringValue(
                            filters.amenities,
                            amenity,
                          ),
                        })
                      }
                      className={cn(
                        "h-4 w-4 rounded border-slate-300 text-brand-700",
                        focusRing,
                      )}
                    />
                    {amenity}
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>
        )}
      </div>
    </Card>
  );
}

type MobileFilterToggleProps = {
  isOpen: boolean;
  onToggle: () => void;
  activeFilterCount: number;
  /** Id of the filters panel this button controls. */
  controlsId?: string;
};

/** Mobile button to show/hide the filter sidebar. */
export function MobileFilterToggle({
  isOpen,
  onToggle,
  activeFilterCount,
  controlsId = "results-filters-panel",
}: MobileFilterToggleProps) {
  return (
    <Button
      variant="secondary"
      type="button"
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-controls={controlsId}
      className="w-full lg:hidden"
    >
      {isOpen ? "Hide filters" : "Show filters"}
      {activeFilterCount > 0 && ` (${activeFilterCount})`}
    </Button>
  );
}
