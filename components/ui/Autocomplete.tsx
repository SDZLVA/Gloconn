"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  AutocompleteDropdown,
  buildAutocompleteListItems,
} from "@/components/ui/AutocompleteDropdown";
import type {
  AutocompleteOption,
  AutocompleteSection,
} from "@/components/ui/autocomplete-types";
import { FormError, FormLabel } from "@/components/ui/FormField";
import { cn } from "@/lib/utils";

export type { AutocompleteOption, AutocompleteSection } from "@/components/ui/autocomplete-types";

type AutocompleteProps = {
  id?: string;
  label: string;
  placeholder?: string;
  value: string;
  /** Flat option list — use when you do not need grouped sections. */
  options?: AutocompleteOption[];
  /** Grouped sections (Recent, Popular, etc.). Takes precedence over `options`. */
  sections?: AutocompleteSection[];
  onChange: (value: string) => void;
  onSelect?: (option: AutocompleteOption) => void;
  error?: string;
  required?: boolean;
  noResultsMessage?: string;
  className?: string;
  /** Called when the suggestion list opens (focus or typing). */
  onListOpen?: () => void;
};

/**
 * Autocomplete — accessible combobox with keyboard navigation.
 *
 * Filters options as the user types. Supports arrow keys, Enter, Escape,
 * and click-to-select. Optional grouped sections for richer dropdowns.
 * No external API — parent supplies the options list.
 */
export function Autocomplete({
  id: idProp,
  label,
  placeholder,
  value,
  options = [],
  sections,
  onChange,
  onSelect,
  error,
  required = false,
  noResultsMessage = "No matches found.",
  className,
  onListOpen,
}: AutocompleteProps) {
  const generatedId = useId();
  const inputId = idProp ?? generatedId;
  const listboxId = `${inputId}-listbox`;
  const errorId = `${inputId}-error`;

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const resolvedSections = useMemo<AutocompleteSection[]>(() => {
    if (sections && sections.length > 0) {
      return sections.filter((section) => section.options.length > 0);
    }

    if (options.length === 0) {
      return [];
    }

    return [{ id: "default", heading: "", options }];
  }, [options, sections]);

  const flatOptions = useMemo(
    () => resolvedSections.flatMap((section) => section.options),
    [resolvedSections],
  );

  const listItems = useMemo(
    () => buildAutocompleteListItems(resolvedSections),
    [resolvedSections],
  );

  const showList = isOpen && (flatOptions.length > 0 || value.trim().length > 0);

  function openList() {
    onListOpen?.();
    setIsOpen(true);
    setHighlightedIndex(-1);
  }

  function closeList() {
    setIsOpen(false);
    setHighlightedIndex(-1);
  }

  function selectOption(option: AutocompleteOption) {
    onChange(option.label);
    onSelect?.(option);
    closeList();
    document.getElementById(inputId)?.focus();
  }

  function handleInputChange(nextValue: string) {
    onChange(nextValue);
    openList();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!showList && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      openList();
      return;
    }

    if (!showList) {
      return;
    }

    switch (event.key) {
      case "ArrowDown": {
        event.preventDefault();
        setHighlightedIndex((current) =>
          current < flatOptions.length - 1 ? current + 1 : 0,
        );
        break;
      }
      case "ArrowUp": {
        event.preventDefault();
        setHighlightedIndex((current) =>
          current > 0 ? current - 1 : flatOptions.length - 1,
        );
        break;
      }
      case "Enter": {
        event.preventDefault();
        if (highlightedIndex >= 0 && flatOptions[highlightedIndex]) {
          selectOption(flatOptions[highlightedIndex]);
        }
        break;
      }
      case "Escape": {
        event.preventDefault();
        closeList();
        break;
      }
      case "Tab": {
        closeList();
        break;
      }
    }
  }

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        closeList();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    if (highlightedIndex < 0 || !listRef.current) {
      return;
    }

    const highlighted = listRef.current.querySelector<HTMLElement>(
      `[data-option-index="${highlightedIndex}"]`,
    );
    highlighted?.scrollIntoView({ block: "nearest" });
  }, [highlightedIndex]);

  const activeDescendant =
    highlightedIndex >= 0 ? `${inputId}-option-${highlightedIndex}` : undefined;

  return (
    <div ref={containerRef} className={cn("relative flex flex-col gap-2", className)}>
      <FormLabel htmlFor={inputId} required={required}>
        {label}
      </FormLabel>

      <div className="relative">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400"
        >
          <SearchIcon />
        </span>

        <input
          ref={inputRef}
          id={inputId}
          type="text"
          role="combobox"
          autoComplete="off"
          value={value}
          placeholder={placeholder}
          required={required}
          aria-expanded={showList}
          aria-controls={listboxId}
          aria-activedescendant={activeDescendant}
          aria-autocomplete="list"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          onChange={(event) => handleInputChange(event.target.value)}
          onFocus={openList}
          onKeyDown={handleKeyDown}
          className={cn(
            "w-full rounded-xl border bg-white py-3 pl-10 pr-4 text-base text-slate-900 placeholder:text-slate-400 motion-safe:transition-all motion-safe:duration-200 focus:outline-none focus:ring-2 sm:text-sm",
            error
              ? "border-red-300 focus:border-red-500 focus:ring-red-100"
              : "border-slate-200 motion-safe:hover:border-slate-300 focus:border-brand-700 focus:ring-brand-100",
          )}
        />
      </div>

      {showList && (
        <AutocompleteDropdown
          listboxId={listboxId}
          inputId={inputId}
          ariaLabel={label}
          listRef={listRef}
          listItems={listItems}
          flatOptions={flatOptions}
          highlightedIndex={highlightedIndex}
          onHighlight={setHighlightedIndex}
          onSelect={selectOption}
          noResultsMessage={noResultsMessage}
        />
      )}

      {error && <FormError id={errorId} message={error} />}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="size-4"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
