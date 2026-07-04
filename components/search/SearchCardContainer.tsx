"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { SearchCard } from "@/components/search/SearchCard";
import { parseSearchParamsToForm } from "@/lib/search/params";
import { cn } from "@/lib/utils";

type SearchCardContainerProps = {
  className?: string;
};

function SearchCardWithParams({ className }: SearchCardContainerProps) {
  const searchParams = useSearchParams();

  const initialForm = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    if ([...params.keys()].length === 0) {
      return undefined;
    }

    return parseSearchParamsToForm(params);
  }, [searchParams]);

  return <SearchCard className={className} initialForm={initialForm} />;
}

/**
 * SearchCardContainer — hydrates the search form from URL params when present.
 * Wraps SearchCard in Suspense for useSearchParams().
 */
export function SearchCardContainer({ className }: SearchCardContainerProps) {
  return (
    <Suspense fallback={<SearchCard className={cn(className)} />}>
      <SearchCardWithParams className={className} />
    </Suspense>
  );
}
