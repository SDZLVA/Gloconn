"use client";

import { SearchForm } from "@/components/search/SearchForm";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useSearchForm } from "@/hooks/useSearchForm";
import { cn } from "@/lib/utils";
import type { UseSearchFormOptions } from "@/types/search-form";

type SearchCardProps = UseSearchFormOptions & {
  className?: string;
};

/**
 * SearchCard — home page search panel (card chrome + heading + SearchForm).
 *
 * Business logic: `useSearchForm` hook.
 * Form UI: `SearchForm` component.
 * This file only adds the Card wrapper and hero heading.
 */
export function SearchCard({ className, initialForm }: SearchCardProps) {
  const controller = useSearchForm({ initialForm });

  return (
    <Card
      hoverable
      className={cn("w-full max-w-4xl p-6 sm:p-8 lg:p-9", className)}
    >
      <SectionHeading
        className="mb-7 space-y-1 sm:mb-8"
        title="Plan your trip"
        description="Start planning your next adventure"
      />

      <SearchForm controller={controller} />
    </Card>
  );
}
