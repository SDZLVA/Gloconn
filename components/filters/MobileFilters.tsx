"use client";

/**
 * Milestone 38 — mobile results layout. On phones the filter box no longer
 * sits above the results: a slim bar (Filter · Sort · Map) stays at the top
 * and the filters open as a full-screen sheet. On desktop (lg and up) the
 * filters stay in the left column as before.
 */

import { useEffect, useState } from "react";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { cn } from "@/lib/utils";

export function useMobileFilters() {
  const [open, setOpen] = useState(false);
  useBodyScrollLock(open);
  // Leaving phone width (e.g. rotating a tablet) closes the sheet.
  useEffect(() => {
    if (!open) return;
    const media = window.matchMedia("(min-width: 1024px)");
    const onChange = () => media.matches && setOpen(false);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  return { open, setOpen };
}

type FiltersAsideProps = {
  id: string;
  open: boolean;
  onClose: () => void;
  /** Desktop classes for the left column (sticky etc.). */
  className?: string;
  children: React.ReactNode;
};

/** Left column on desktop; full-screen sheet on phones while open. */
export function FiltersAside({ id, open, onClose, className, children }: FiltersAsideProps) {
  return (
    <aside
      id={id}
      className={cn(
        open
          ? "fixed inset-0 z-[60] flex flex-col bg-slate-50 lg:static lg:z-auto lg:block lg:bg-transparent"
          : "hidden lg:block",
        className,
      )}
      role={open ? "dialog" : undefined}
      aria-modal={open ? true : undefined}
      aria-label={open ? "Filters" : undefined}
    >
      {open && (
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <p className="text-base font-bold text-slate-900">Filters</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Close ✕
          </button>
        </div>
      )}
      <div className={open ? "min-h-0 flex-1 space-y-4 overflow-y-auto p-4 lg:contents" : "contents"}>{children}</div>
    </aside>
  );
}

type SortOption = { value: string; label: string };

type MobileResultsBarProps = {
  filtersId: string;
  onOpenFilters: () => void;
  activeFilterCount?: number;
  sortValue: string;
  sortOptions: readonly SortOption[];
  onSortChange: (value: string) => void;
  /** Optional third button (hotels map). */
  onOpenMap?: () => void;
};

const BAR_BUTTON =
  "flex min-h-11 flex-1 items-center justify-center gap-2 text-sm font-semibold text-slate-800 hover:bg-slate-50";

/** Filter · Sort · Map bar shown above the results on phones only. */
export function MobileResultsBar({
  filtersId,
  onOpenFilters,
  activeFilterCount = 0,
  sortValue,
  sortOptions,
  onSortChange,
  onOpenMap,
}: MobileResultsBarProps) {
  const sortLabel = sortOptions.find((option) => option.value === sortValue)?.label ?? "Sort";
  return (
    <div className="sticky top-16 z-40 -mx-4 flex divide-x divide-slate-200 border-y border-slate-200 bg-white/95 backdrop-blur sm:-mx-6 lg:hidden">
      <button type="button" onClick={onOpenFilters} aria-controls={filtersId} className={BAR_BUTTON}>
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
        </svg>
        Filter
        {activeFilterCount > 0 && (
          <span className="rounded-full bg-brand-700 px-1.5 text-xs font-bold text-white">{activeFilterCount}</span>
        )}
      </button>
      <label className={cn(BAR_BUTTON, "relative cursor-pointer")}>
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M7 4v16M3 16l4 4 4-4M17 20V4M13 8l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="truncate">{sortLabel}</span>
        <select
          aria-label="Sort results"
          value={sortValue}
          onChange={(event) => onSortChange(event.target.value)}
          className="absolute inset-0 cursor-pointer opacity-0"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      {onOpenMap && (
        <button type="button" onClick={onOpenMap} className={BAR_BUTTON}>
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Zm0 0v14m6-12v14" strokeLinejoin="round" />
          </svg>
          Map
        </button>
      )}
    </div>
  );
}
