"use client";

import { cn } from "@/lib/utils";
import { focusRing } from "@/lib/styles";
import type { DatePriceStripChip } from "@/lib/results/datePriceStrip";

type DatePriceStripProps = {
  chips: readonly DatePriceStripChip[];
  /** Optional footer line (e.g. all-over-budget message). */
  footerMessage?: string | null;
  className?: string;
};

/**
 * Horizontal date price strip — display-only in Sprint 18.5 (selection in 18.6).
 * First chip is "Your dates"; explore chips follow earliest-first.
 */
export function DatePriceStrip({
  chips,
  footerMessage,
  className,
}: DatePriceStripProps) {
  if (chips.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-2", className)} role="region" aria-label="Date price options">
      <div className="-mx-1 overflow-x-auto overscroll-x-contain px-1 pb-1">
        <ul
          className="flex min-w-0 list-none flex-row gap-2 p-0"
          role="list"
        >
          {chips.map((chip) => (
            <li key={chip.id} className="min-w-0 shrink-0">
              <div
                tabIndex={0}
                aria-current={chip.isCurrent ? "true" : undefined}
                aria-label={chipAriaLabel(chip)}
                className={cn(
                  "flex h-full min-w-[7.5rem] max-w-[10rem] flex-col gap-0.5 rounded-xl border px-3 py-2.5 text-left",
                  focusRing,
                  chip.isCurrent &&
                    "border-slate-300 bg-slate-50 text-slate-800",
                  !chip.isCurrent &&
                    chip.highlighted &&
                    "border-brand-700 bg-brand-50 text-brand-900 shadow-sm shadow-brand-100",
                  !chip.isCurrent &&
                    chip.fitsBudget &&
                    !chip.highlighted &&
                    "border-emerald-300 bg-emerald-50/80 text-emerald-950",
                  !chip.isCurrent &&
                    !chip.fitsBudget &&
                    !chip.highlighted &&
                    "border-slate-200 bg-white text-slate-700",
                )}
              >
                {chip.isCurrent && (
                  <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-slate-500">
                    Your dates
                  </span>
                )}
                <span className="truncate text-sm font-semibold leading-tight">
                  {chip.dateLabel || "—"}
                </span>
                {chip.priceLabel ? (
                  <span className="flex items-center gap-1 text-xs font-medium tabular-nums">
                    <span>{chip.priceLabel}</span>
                    {chip.fitsBudget && (
                      <span aria-hidden="true" className="text-emerald-700">
                        ✓
                      </span>
                    )}
                    {chip.fitsBudget && (
                      <span className="sr-only">Fits your budget</span>
                    )}
                  </span>
                ) : (
                  <span className="text-xs text-slate-500">
                    {chip.statusLabel ?? "—"}
                  </span>
                )}
                {chip.highlighted && (
                  <span className="text-[0.65rem] font-medium text-brand-800">
                    Best fit
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
      {footerMessage ? (
        <p className="text-sm text-amber-900/90" role="status">
          {footerMessage}
        </p>
      ) : null}
    </div>
  );
}

function chipAriaLabel(chip: DatePriceStripChip): string {
  const parts = [
    chip.isCurrent ? "Your dates" : "Nearby dates",
    chip.dateLabel,
  ];
  if (chip.priceLabel) {
    parts.push(chip.priceLabel);
    if (chip.fitsBudget) {
      parts.push("fits budget");
    }
  } else if (chip.statusLabel) {
    parts.push(chip.statusLabel);
  }
  if (chip.highlighted) {
    parts.push("best fit");
  }
  return parts.filter(Boolean).join(", ");
}
