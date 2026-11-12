"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FilterCheck, FilterList, FilterMoneyInput, FilterPanel, FilterRadios, FilterSection } from "@/components/filters/FilterPanel";
import type {
  ResultType,
  ResultsFilterFacets,
  ResultsFilters,
} from "@/types/results";
import { DEFAULT_RESULTS_FILTERS, RESULT_TYPE_LABELS } from "@/types/results";
import { MVP_RESULT_TYPES } from "@/lib/results/mvpUi";
import { PROPERTY_KINDS } from "@/features/liveHotels/propertyKind";

/** Sprint 14.2 MVP — hotel + flight only (bus/train filters hidden). */
const FILTERABLE_TYPES = MVP_RESULT_TYPES;

const RATING_OPTIONS = [
  { value: 0, label: "Any score" },
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
  /** Milestone 31: shown in the price inputs. */
  currency?: string;
  className?: string;
};

function toggleStringValue(values: string[], value: string): string[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

/** Sidebar with type, price, rating, and model-backed quality filters. */
export function ResultsFilterSidebar({
  filters: appliedFilters,
  onFiltersChange: applyFilters,
  priceRange,
  facets,
  currency = "EUR",
  className,
}: ResultsFilterSidebarProps) {
  // Milestone 35: choices are a draft until the traveller presses Confirm.
  const [filters, setDraft] = useState(appliedFilters);
  const onFiltersChange = setDraft;
  // Follow resets made elsewhere (new search, Clear all).
  useEffect(() => setDraft(appliedFilters), [appliedFilters]);
  const draftMinPrice = filters.minPrice;
  const draftMaxPrice = filters.maxPrice;
  const dirty = JSON.stringify(filters) !== JSON.stringify(appliedFilters);

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
    applyFilters({
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

  const activeCount =
    (filters.types.length !== FILTERABLE_TYPES.length ? 1 : 0) +
    (draftMinPrice !== priceRange.min || draftMaxPrice !== priceRange.max ? 1 : 0) +
    (filters.minRating ? 1 : 0) +
    (filters.maxStops !== null ? 1 : 0) +
    (filters.baggageIncluded ? 1 : 0) +
    filters.cabins.length +
    filters.airlines.length +
    (filters.minStars ? 1 : 0) +
    filters.amenities.length;

  // Milestone 31: same FilterPanel look as the Flights and Hotels pages.
  return (
    <FilterPanel className={className} activeCount={activeCount} onClear={clearFilters} dirty={dirty} onConfirm={() => applyFilters(filters)}>
      <FilterSection title="Show">
        {FILTERABLE_TYPES.map((type) => (
          <FilterCheck key={type} label={RESULT_TYPE_LABELS[type]} checked={filters.types.includes(type)} onChange={() => toggleType(type)} />
        ))}
      </FilterSection>

      <FilterSection title="Your budget" hint="Price range">
        <div className="grid grid-cols-2 gap-2">
          <FilterMoneyInput
            id="min-price"
            label="Minimum price"
            currency={currency}
            value={String(draftMinPrice)}
            onChange={(value) => onFiltersChange({ ...filters, minPrice: Number(value || priceRange.min) })}
          />
          <FilterMoneyInput
            id="max-price"
            label="Maximum price"
            currency={currency}
            value={String(draftMaxPrice)}
            onChange={(value) => onFiltersChange({ ...filters, maxPrice: Number(value || priceRange.max) })}
          />
        </div>
      </FilterSection>

      <FilterSection title="Review score">
        <FilterRadios
          name="min-rating"
          value={filters.minRating}
          options={RATING_OPTIONS}
          onChange={(minRating) => onFiltersChange({ ...filters, minRating })}
        />
      </FilterSection>

      {showFlightFilters && (
        <>
          <FilterSection title="Stops">
            <FilterRadios
              name="max-stops"
              value={filters.maxStops}
              options={STOP_OPTIONS}
              onChange={(maxStops) => onFiltersChange({ ...filters, maxStops })}
            />
          </FilterSection>

          {/* Milestone 24: applied to the live flights list only. */}
          <FilterSection title="Baggage">
            <FilterCheck
              label="Checked bag included"
              hint="Live flights only"
              checked={Boolean(filters.baggageIncluded)}
              onChange={(baggageIncluded) => onFiltersChange({ ...filters, baggageIncluded })}
            />
          </FilterSection>

          {facets.cabins.length > 0 && (
            <FilterSection title="Cabin class">
              <FilterList>
                {facets.cabins.map((cabin) => (
                  <FilterCheck
                    key={cabin}
                    label={cabin}
                    checked={filters.cabins.includes(cabin)}
                    onChange={() => onFiltersChange({ ...filters, cabins: toggleStringValue(filters.cabins, cabin) })}
                  />
                ))}
              </FilterList>
            </FilterSection>
          )}

          {facets.airlines.length > 0 && (
            <FilterSection title="Airlines">
              <FilterList>
                {facets.airlines.map((airline) => (
                  <FilterCheck
                    key={airline}
                    label={airline}
                    checked={filters.airlines.includes(airline)}
                    onChange={() => onFiltersChange({ ...filters, airlines: toggleStringValue(filters.airlines, airline) })}
                  />
                ))}
              </FilterList>
            </FilterSection>
          )}
        </>
      )}

      {showHotelStars && PROPERTY_KINDS.some((k) => (facets.propertyTypes?.[k.kind] ?? 0) > 0) && (
        <FilterSection title="Property type">
          <FilterList>
            {PROPERTY_KINDS.filter((k) => (facets.propertyTypes?.[k.kind] ?? 0) > 0 || filters.propertyTypes?.includes(k.kind)).map(({ kind, label }) => {
              const chosen = filters.propertyTypes ?? [];
              return (
                <FilterCheck
                  key={kind}
                  label={label}
                  count={facets.propertyTypes?.[kind] ?? 0}
                  checked={chosen.includes(kind)}
                  onChange={(on) =>
                    onFiltersChange({ ...filters, propertyTypes: on ? [...chosen, kind] : chosen.filter((t) => t !== kind) })
                  }
                />
              );
            })}
          </FilterList>
        </FilterSection>
      )}

      {showHotelStars && (
        <FilterSection title="Star rating">
          <FilterRadios
            name="min-stars"
            value={filters.minStars}
            options={STAR_OPTIONS}
            onChange={(minStars) => onFiltersChange({ ...filters, minStars })}
          />
        </FilterSection>
      )}

      {showAmenities && (
        <FilterSection title="Amenities" hint="Results must include every selected amenity.">
          <FilterList>
            {facets.amenities.map((amenity) => (
              <FilterCheck
                key={amenity}
                label={amenity}
                checked={filters.amenities.includes(amenity)}
                onChange={() => onFiltersChange({ ...filters, amenities: toggleStringValue(filters.amenities, amenity) })}
              />
            ))}
          </FilterList>
        </FilterSection>
      )}
    </FilterPanel>
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
