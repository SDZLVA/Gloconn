"use client";

import { useEffect, useId, useState } from "react";
import { DestinationAutocomplete } from "@/components/search/DestinationAutocomplete";
import { OriginAutocomplete } from "@/components/search/OriginAutocomplete";
import { TravelDatesSelector } from "@/components/search/TravelDatesSelector";
import { TravelersSelector } from "@/components/search/TravelersSelector";
import { PassengersSelector } from "@/components/ui/PassengersSelector";
import { useSearchForm } from "@/hooks/useSearchForm";
import { CURRENCY_OPTIONS, type CurrencyCode } from "@/lib/budget/currencies";
import { productTypesForMode, type SearchMode } from "@/lib/search/modes";
import { focusRing } from "@/lib/styles";
import { cn } from "@/lib/utils";
import type { SearchFormState } from "@/types/search-form";

export type BarMode = Exclude<SearchMode, "transport">;

/**
 * Turns a field component's "label above a bordered box" layout into a white
 * cell with the label inside it (Booking-style). Targets the components'
 * own markup: root div > label + input (autocomplete) or button (pickers).
 */
const CELL = cn(
  "relative min-w-0 [&>div]:gap-1",
  "[&>div>label]:pointer-events-none [&>div>label]:absolute [&>div>label]:top-[0.6rem] [&>div>label]:z-[2]",
  "[&>div>label]:text-xs [&>div>label]:font-medium [&>div>label]:tracking-normal [&>div>label]:text-slate-500",
  "[&>div>label>span]:hidden",
  "[&_input[role=combobox]]:min-h-[3.75rem] [&_input[role=combobox]]:rounded-xl [&_input[role=combobox]]:border-transparent [&_input[role=combobox]]:bg-white",
  "[&_input[role=combobox]]:pb-[0.45rem] [&_input[role=combobox]]:pt-6 [&_input[role=combobox]]:text-[0.95rem] [&_input[role=combobox]]:font-semibold",
  "[&_input[role=combobox]:focus]:border-brand-700 [&_input[role=combobox]:focus]:shadow-[0_0_0_3px_#dbeafe]",
  "[&>div>button]:min-h-[3.75rem] [&>div>button]:rounded-xl [&>div>button]:border-transparent [&>div>button]:bg-white",
  "[&>div>button]:pb-[0.45rem] [&>div>button]:pt-6 [&>div>button]:text-[0.95rem] [&>div>button]:font-semibold",
  "[&>div>button:focus]:border-brand-700 [&>div>button:focus]:shadow-[0_0_0_3px_#dbeafe]",
  "[&_[role=alert]]:mt-1 [&_[role=alert]]:rounded-lg [&_[role=alert]]:bg-red-50 [&_[role=alert]]:px-2 [&_[role=alert]]:py-1 [&_[role=alert]]:text-xs",
);
// One label position per cell (cn() does not merge conflicting classes).
const CELL_PLAIN = "[&>div>label]:left-4";
const CELL_ICON = "[&>div>label]:left-10";
const CELL_DATE = "[&>div>label]:left-[3.25rem]";

type ModeSearchBarProps = {
  mode: BarMode;
  initialForm?: Partial<SearchFormState>;
  /** Flights: "Direct flights only" starts ticked (URL had stops=0). */
  initialDirectOnly?: boolean;
  className?: string;
};

/**
 * Milestone 28 — one-row search bar for a search mode (Packages, Flights,
 * Hotels). Same form state and validation as before (`useSearchForm`); the
 * mode only sets which products are searched. Used on the home page under
 * the mode tabs and at the top of the live results pages.
 */
export function ModeSearchBar({
  mode,
  initialForm,
  initialDirectOnly = false,
  className,
}: ModeSearchBarProps) {
  const [directOnly, setDirectOnly] = useState(initialDirectOnly);
  const { form, errors, actions } = useSearchForm({
    initialForm: { ...initialForm, productTypes: productTypesForMode(mode) },
    resultParams: mode === "flights" && directOnly ? { stops: "0" } : undefined,
  });

  // Switching tabs keeps what was typed; only the searched products change.
  const { updateProductTypes, updateTripType } = actions;
  useEffect(() => {
    updateProductTypes(productTypesForMode(mode));
    if (mode === "hotels") updateTripType("round-trip"); // check-in + check-out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    actions.submit();
  }

  const showOrigin = mode !== "hotels";

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-label={`${mode === "packages" ? "Package" : mode === "flights" ? "Flight" : "Hotel"} search`}
      className={cn("w-full", className)}
    >
      {mode === "flights" && (
        <div className="mb-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-white">
          <div role="radiogroup" aria-label="Trip type" className="flex items-center gap-5">
            {(
              [
                ["round-trip", "Round trip"],
                ["one-way", "One way"],
              ] as const
            ).map(([value, label]) => (
              <label key={value} className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="trip-type"
                  value={value}
                  checked={form.tripType === value}
                  onChange={() => actions.updateTripType(value)}
                  className="h-4 w-4 accent-sky-300"
                />
                {label}
              </label>
            ))}
          </div>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={directOnly}
              onChange={(event) => setDirectOnly(event.target.checked)}
              className="h-4 w-4 rounded accent-sky-300"
            />
            Direct flights only
          </label>
        </div>
      )}

      <div className="flex flex-col gap-1 rounded-2xl bg-sky-300 p-1 shadow-xl shadow-brand-900/20 lg:flex-row lg:items-stretch">
        {showOrigin && (
          <>
            <div className={cn(CELL, CELL_ICON, "lg:flex-[1.25]")}>
              <OriginAutocomplete
                value={form.origin}
                onChange={actions.updateOrigin}
                onOriginSelect={actions.selectOrigin}
                error={errors.origin}
                required
              />
            </div>
            <button
              type="button"
              onClick={actions.swapOriginAndDestination}
              aria-label="Swap origin and destination"
              title="Swap"
              className={cn(
                "flex h-10 items-center justify-center rounded-xl bg-white text-brand-700 motion-safe:transition-colors hover:bg-brand-50 lg:h-auto lg:w-11 lg:shrink-0",
                focusRing,
              )}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 rotate-90 lg:rotate-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M7 8h12M16 5l3 3-3 3M17 16H5M8 13l-3 3 3 3" />
              </svg>
            </button>
          </>
        )}

        <div className={cn(CELL, CELL_ICON, showOrigin ? "lg:flex-[1.25]" : "lg:flex-[1.6]")}>
          <DestinationAutocomplete
            label={mode === "hotels" ? "Destination" : "To"}
            placeholder={mode === "hotels" ? "Where are you going?" : "Where to?"}
            value={form.destination}
            onChange={actions.updateDestination}
            onDestinationSelect={actions.selectDestination}
            error={errors.destination}
            required
          />
        </div>

        <div className={cn(CELL, CELL_DATE, "lg:flex-[1.3]")}>
          <TravelDatesSelector
            tripType={form.tripType}
            departureDate={form.departureDate}
            returnDate={form.returnDate}
            onTripTypeChange={actions.updateTripType}
            onDatesChange={actions.updateDates}
            departureError={errors.departureDate}
            returnError={errors.returnDate}
            required
          />
        </div>

        <div className={cn(CELL, CELL_PLAIN, "lg:flex-1")}>
          {mode === "flights" ? (
            <TravelersSelector
              value={form.travelers}
              onChange={actions.updateTravelers}
              error={errors.travelers}
              required
            />
          ) : (
            <PassengersSelector
              value={form.travelers}
              onChange={actions.updateTravelers}
              error={errors.travelers}
              required
              label={mode === "hotels" ? "Guests & rooms" : "Travelers & rooms"}
              fields={mode === "hotels" ? ["adults", "children", "rooms"] : ["adults", "children", "infants", "rooms"]}
              includeRoomsInSummary
              panelAriaLabel={mode === "hotels" ? "Select guests and rooms" : "Select travelers and rooms"}
            />
          )}
        </div>

        <BarBudgetField
          value={form.budget}
          currency={form.budgetCurrency}
          onChange={(value) => actions.updateField("budget", value)}
          onCurrencyChange={(value) => actions.updateField("budgetCurrency", value)}
          error={errors.budget}
          label={mode === "hotels" ? "Budget for the stay" : mode === "flights" ? "Max price" : "Total budget"}
        />

        <button
          type="submit"
          className={cn(
            "min-h-[3.75rem] rounded-xl bg-brand-700 px-8 text-base font-bold text-white shadow-md shadow-brand-900/20 motion-safe:transition-colors hover:bg-brand-800 lg:shrink-0",
            focusRing,
          )}
        >
          Search
        </button>
      </div>
    </form>
  );
}

type BarBudgetFieldProps = {
  value: string;
  currency: CurrencyCode;
  onChange: (value: string) => void;
  onCurrencyChange: (currency: CurrencyCode) => void;
  error?: string;
  label: string;
};

/** Budget cell: currency + whole-number amount, styled like the other cells. */
function BarBudgetField({ value, currency, onChange, onCurrencyChange, error, label }: BarBudgetFieldProps) {
  const id = useId();
  return (
    <div className="relative min-w-0 lg:flex-[0.95]">
      <div
        className={cn(
          "relative flex min-h-[3.75rem] items-end gap-1.5 rounded-xl border border-transparent bg-white px-4 pb-[0.45rem] pt-6",
          "focus-within:border-brand-700 focus-within:shadow-[0_0_0_3px_#dbeafe]",
        )}
      >
        <label htmlFor={`${id}-amount`} className="pointer-events-none absolute left-4 top-[0.6rem] text-xs font-medium text-slate-500">
          {label}
        </label>
        <select
          aria-label="Budget currency"
          value={currency}
          onChange={(event) => onCurrencyChange(event.target.value as CurrencyCode)}
          className="shrink-0 cursor-pointer border-0 bg-transparent p-0 text-[0.95rem] font-semibold text-brand-800 focus:outline-none"
        >
          {CURRENCY_OPTIONS.map((option) => (
            <option key={option.code} value={option.code}>
              {option.code}
            </option>
          ))}
        </select>
        <input
          id={`${id}-amount`}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          placeholder="Any"
          value={value}
          onChange={(event) => onChange(event.target.value.replace(/[^\d]/g, ""))}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[0.95rem] font-semibold text-slate-900 placeholder:font-medium placeholder:text-slate-400 focus:outline-none"
        />
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 rounded-lg bg-red-50 px-2 py-1 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
