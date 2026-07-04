"use client";

import { SearchForm } from "@/components/search/SearchForm";
import { useSearchForm } from "@/hooks/useSearchForm";
import type { UseSearchFormOptions } from "@/types/search-form";

type SearchFormWithStateProps = UseSearchFormOptions & {
  className?: string;
  submitLabel?: string;
};

/**
 * SearchFormWithState — connects `useSearchForm` to the presentational `SearchForm`.
 *
 * Use when you need the full form without the home page card wrapper
 * (e.g. a future sidebar or modal search panel).
 */
export function SearchFormWithState({
  initialForm,
  className,
  submitLabel,
}: SearchFormWithStateProps) {
  const controller = useSearchForm({ initialForm });

  return (
    <SearchForm
      controller={controller}
      className={className}
      submitLabel={submitLabel}
    />
  );
}
