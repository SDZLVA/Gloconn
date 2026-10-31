"use client";

/**
 * Milestone 31 — the one filter look for every results page (Packages,
 * Flights, Hotels): a white "Filter by" card on the left with sections of
 * checkboxes, radios and price inputs. Each page decides which sections it
 * shows; the look and behaviour are the same everywhere.
 */

import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

type FilterPanelProps = {
  title?: string;
  activeCount?: number;
  onClear?: () => void;
  className?: string;
  children: React.ReactNode;
};

export function FilterPanel({ title = "Filter by", activeCount = 0, onClear, className, children }: FilterPanelProps) {
  return (
    <Card className={cn("divide-y divide-slate-100 p-0", className)}>
      <div className="flex items-center justify-between px-5 py-4">
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
        {onClear && activeCount > 0 && (
          <button type="button" onClick={onClear} className="text-sm font-semibold text-brand-700 hover:text-brand-900">
            Clear all
          </button>
        )}
      </div>
      {children}
    </Card>
  );
}

export function FilterSection({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset className="px-5 py-4">
      <legend className="sr-only">{title}</legend>
      <p className="text-sm font-bold text-slate-900" aria-hidden="true">
        {title}
      </p>
      {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
      <div className="mt-3 space-y-2.5">{children}</div>
    </fieldset>
  );
}

type FilterCheckProps = {
  label: React.ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  count?: number;
  hint?: string;
};

export function FilterCheck({ label, checked, onChange, count, hint }: FilterCheckProps) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-3 text-sm text-slate-700">
      <span className="flex items-start gap-2.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 rounded accent-brand-700"
        />
        <span>
          {label}
          {hint && <span className="block text-xs text-slate-500">{hint}</span>}
        </span>
      </span>
      {count !== undefined && <span className="text-slate-400">{count}</span>}
    </label>
  );
}

type FilterRadiosProps<T> = {
  name: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
};

export function FilterRadios<T>({ name, value, options, onChange }: FilterRadiosProps<T>) {
  return (
    <>
      {options.map((option) => (
        <label key={String(option.value)} className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
          <input
            type="radio"
            name={name}
            checked={option.value === value}
            onChange={() => onChange(option.value)}
            className="h-4 w-4 accent-brand-700"
          />
          {option.label}
        </label>
      ))}
    </>
  );
}

type FilterMoneyInputProps = {
  id: string;
  label: string;
  currency: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

/** Whole-number amount with the currency in front. */
export function FilterMoneyInput({ id, label, currency, value, onChange, placeholder = "Any" }: FilterMoneyInputProps) {
  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 focus-within:border-brand-700 focus-within:ring-2 focus-within:ring-brand-100">
        <span className="text-sm font-semibold text-slate-500">{currency}</span>
        <input
          id={id}
          inputMode="numeric"
          placeholder={placeholder}
          aria-label={label}
          value={value}
          onChange={(event) => onChange(event.target.value.replace(/[^\d]/g, ""))}
          className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:outline-none"
        />
      </div>
    </div>
  );
}

/** Long lists (airlines, amenities) scroll after ~8 rows. */
export function FilterList({ children }: { children: React.ReactNode }) {
  return <div className="max-h-64 space-y-2.5 overflow-y-auto pr-1">{children}</div>;
}
