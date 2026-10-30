"use client";

import { SEARCH_MODES, type SearchMode } from "@/lib/search/modes";
import { cn } from "@/lib/utils";

type SearchModeTabsProps = {
  value: SearchMode;
  onChange: (mode: SearchMode) => void;
  className?: string;
};

/** Milestone 28 — Packages · Flights · Hotels · Mixed Transport pills. */
export function SearchModeTabs({ value, onChange, className }: SearchModeTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="What are you searching for?"
      className={cn("-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 sm:gap-2", className)}
    >
      {SEARCH_MODES.map((mode) => {
        const active = mode.value === value;
        return (
          <button
            key={mode.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(mode.value)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold motion-safe:transition-colors",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
              active ? "border-white bg-white/15 text-white" : "border-transparent text-blue-100 hover:bg-white/10 hover:text-white",
            )}
          >
            <ModeIcon mode={mode.value} />
            {mode.label}
            {!mode.available && (
              <span className="rounded-full bg-sky-300 px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none text-brand-900">
                Soon
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function ModeIcon({ mode }: { mode: SearchMode }) {
  const common = {
    viewBox: "0 0 24 24",
    className: "h-5 w-5 shrink-0",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (mode) {
    case "packages":
      return (
        <svg {...common}>
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2" />
        </svg>
      );
    case "flights":
      return (
        <svg {...common}>
          <path d="M10.5 13.5 3 11l1-2 8 1 4.5-5.5c.8-.9 2.3-1 3 0 .6.8.4 1.9-.4 2.6L14 12l1 8-2 1-2.5-7.5Z" />
        </svg>
      );
    case "hotels":
      return (
        <svg {...common}>
          <path d="M3 19V6M3 15h18v4M21 15v-3a3 3 0 0 0-3-3h-7v6" />
          <circle cx="7" cy="11" r="2" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <rect x="4" y="3" width="11" height="13" rx="2" />
          <path d="M4 10h11M7 19l-1.5 2M12 19l1.5 2M7 13h.01M12 13h.01M17 8h3l1 4v4h-2M19 19a1.5 1.5 0 1 1-3 0" />
        </svg>
      );
  }
}
