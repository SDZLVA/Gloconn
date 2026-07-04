"use client";

import { useEffect, useId, useRef, useState } from "react";
import { FormError, FormLabel } from "@/components/ui/FormField";
import { cn } from "@/lib/utils";

export type AutocompleteOption = {
  id: string;
  label: string;
  description?: string;
};

type AutocompleteProps = {
  id?: string;
  label: string;
  placeholder?: string;
  value: string;
  options: AutocompleteOption[];
  onChange: (value: string) => void;
  onSelect?: (option: AutocompleteOption) => void;
  error?: string;
  required?: boolean;
  noResultsMessage?: string;
  className?: string;
};

/**
 * Autocomplete — accessible combobox with keyboard navigation.
 *
 * Filters options as the user types. Supports arrow keys, Enter, Escape,
 * and click-to-select. No external API — parent supplies the options list.
 */
export function Autocomplete({
  id: idProp,
  label,
  placeholder,
  value,
  options,
  onChange,
  onSelect,
  error,
  required = false,
  noResultsMessage = "No matches found.",
  className,
}: AutocompleteProps) {
  const generatedId = useId();
  const inputId = idProp ?? generatedId;
  const listboxId = `${inputId}-listbox`;
  const errorId = `${inputId}-error`;

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const showList = isOpen && (options.length > 0 || value.trim().length > 0);

  function openList() {
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
    inputRef.current?.focus();
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
          current < options.length - 1 ? current + 1 : 0,
        );
        break;
      }
      case "ArrowUp": {
        event.preventDefault();
        setHighlightedIndex((current) =>
          current > 0 ? current - 1 : options.length - 1,
        );
        break;
      }
      case "Enter": {
        event.preventDefault();
        if (highlightedIndex >= 0 && options[highlightedIndex]) {
          selectOption(options[highlightedIndex]);
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

  const activeDescendant =
    highlightedIndex >= 0 ? `${inputId}-option-${highlightedIndex}` : undefined;

  return (
    <div ref={containerRef} className={cn("relative flex flex-col gap-2", className)}>
      <FormLabel htmlFor={inputId} required={required}>
        {label}
      </FormLabel>

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
          "w-full rounded-xl border bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 motion-safe:transition-all motion-safe:duration-200 focus:outline-none focus:ring-2 sm:text-sm",
          error
            ? "border-red-300 focus:border-red-500 focus:ring-red-100"
            : "border-slate-200 motion-safe:hover:border-slate-300 focus:border-brand-700 focus:ring-brand-100",
        )}
      />

      {showList && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label={`${label} suggestions`}
          className="absolute top-full z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg shadow-slate-200/60"
        >
          {options.length === 0 ? (
            <li
              role="option"
              aria-selected={false}
              aria-disabled="true"
              className="px-4 py-3 text-sm text-slate-500"
            >
              {noResultsMessage}
            </li>
          ) : (
            options.map((option, index) => {
              const isHighlighted = index === highlightedIndex;

              return (
                <li
                  key={option.id}
                  id={`${inputId}-option-${index}`}
                  role="option"
                  aria-selected={isHighlighted}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectOption(option)}
                  className={cn(
                    "cursor-pointer px-4 py-2.5 text-sm motion-safe:transition-colors motion-safe:duration-150",
                    isHighlighted
                      ? "bg-brand-50 text-brand-800"
                      : "text-slate-700 hover:bg-slate-50",
                  )}
                >
                  <span className="font-medium">{option.label}</span>
                  {option.description && (
                    <span className="mt-0.5 block text-xs text-slate-500">
                      {option.description}
                    </span>
                  )}
                </li>
              );
            })
          )}
        </ul>
      )}

      {error && <FormError id={errorId} message={error} />}
    </div>
  );
}
