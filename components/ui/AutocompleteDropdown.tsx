"use client";

import type { RefObject } from "react";
import type {
  AutocompleteOption,
  AutocompleteSection,
} from "@/components/ui/autocomplete-types";
import { highlightMatchSegments } from "@/lib/destinations/highlight";
import { cn } from "@/lib/utils";

export type AutocompleteListItem =
  | { type: "heading"; id: string; label: string }
  | { type: "option"; option: AutocompleteOption; index: number };

type AutocompleteDropdownProps = {
  listboxId: string;
  inputId: string;
  /** Accessible name for the listbox (usually the field label). */
  ariaLabel: string;
  listRef: RefObject<HTMLUListElement | null>;
  listItems: AutocompleteListItem[];
  flatOptions: AutocompleteOption[];
  highlightedIndex: number;
  onHighlight: (index: number) => void;
  onSelect: (option: AutocompleteOption) => void;
  noResultsMessage: string;
  /** When set, matching text in labels is visually emphasized. */
  highlightQuery?: string;
  className?: string;
};

/** Renders a label with optional query match highlighting. */
function HighlightedLabel({
  label,
  query,
}: {
  label: string;
  query?: string;
}) {
  if (!query?.trim()) {
    return <span className="font-medium">{label}</span>;
  }

  const segments = highlightMatchSegments(label, query);

  return (
    <span className="font-medium">
      {segments.map((segment, index) =>
        segment.match ? (
          <mark
            key={`m-${index}`}
            className="rounded-sm bg-brand-100 px-0.5 text-inherit"
          >
            {segment.text}
          </mark>
        ) : (
          <span key={`t-${index}`}>{segment.text}</span>
        ),
      )}
    </span>
  );
}

/**
 * AutocompleteDropdown — reusable suggestion list for combobox fields.
 *
 * Renders grouped sections, keyboard highlight, and click-to-select.
 * Parent owns open state and keyboard handling; this component is presentational.
 */
export function AutocompleteDropdown({
  listboxId,
  inputId,
  ariaLabel,
  listRef,
  listItems,
  flatOptions,
  highlightedIndex,
  onHighlight,
  onSelect,
  noResultsMessage,
  highlightQuery,
  className,
}: AutocompleteDropdownProps) {
  const shellClassName = cn(
    "autocomplete-dropdown absolute top-full z-20 mt-1 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg shadow-slate-200/60",
    "max-h-[min(18rem,50vh)] sm:max-h-72",
    className,
  );

  // Empty state must not live inside role="listbox" (invalid child role).
  if (flatOptions.length === 0) {
    return (
      <div
        id={listboxId}
        role="status"
        aria-live="polite"
        className={shellClassName}
      >
        <p className="px-4 py-3 text-sm text-slate-500">{noResultsMessage}</p>
      </div>
    );
  }

  return (
    <ul
      ref={listRef}
      id={listboxId}
      role="listbox"
      aria-label={`${ariaLabel} suggestions`}
      className={shellClassName}
    >
      {listItems.map((item) => {
        if (item.type === "heading") {
          return (
            <li
              key={`heading-${item.id}`}
              role="presentation"
              className="px-4 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-slate-400"
            >
              {item.label}
            </li>
          );
        }

        const isHighlighted = item.index === highlightedIndex;

        return (
          <li
            key={item.option.id}
            id={`${inputId}-option-${item.index}`}
            role="option"
            data-option-index={item.index}
            aria-selected={isHighlighted}
            onMouseEnter={() => onHighlight(item.index)}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onSelect(item.option)}
            className={cn(
              "cursor-pointer px-4 py-3 text-sm motion-safe:transition-colors motion-safe:duration-150 sm:py-2.5",
              isHighlighted
                ? "bg-brand-50 text-brand-800"
                : "text-slate-700 hover:bg-slate-50",
            )}
          >
            <HighlightedLabel
              label={item.option.label}
              query={highlightQuery}
            />
            {item.option.description && (
              <span className="mt-0.5 block text-xs text-slate-500">
                {item.option.description}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** Builds flat list items from grouped sections for keyboard navigation. */
export function buildAutocompleteListItems(
  sections: AutocompleteSection[],
): AutocompleteListItem[] {
  const items: AutocompleteListItem[] = [];
  let index = 0;

  for (const section of sections) {
    if (section.heading) {
      items.push({ type: "heading", id: section.id, label: section.heading });
    }
    for (const option of section.options) {
      items.push({ type: "option", option, index });
      index += 1;
    }
  }

  return items;
}
