import { SearchCard } from "@/components/search/SearchCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";

type HeroSectionProps = {
  title: string;
  subtitle: string;
  className?: string;
};

/**
 * HeroSection — the large welcome area at the top of the home page.
 *
 * Contains a headline, subtitle, and the centered SearchCard.
 * Pass different `title` and `subtitle` text if you reuse this on other pages.
 */
export function HeroSection({ title, subtitle, className }: HeroSectionProps) {
  return (
    <section
      className={cn(
        "relative flex flex-col items-center overflow-hidden rounded-3xl px-4 py-12 text-center sm:px-8 sm:py-16 lg:py-24",
        className,
      )}
      aria-labelledby="hero-heading"
    >
      {/* Soft travel-themed gradient behind the content */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-brand-50 via-sky-50/90 to-transparent"
        aria-hidden="true"
      />

      <SectionHeading
        as="h1"
        align="center"
        id="hero-heading"
        title={title}
        description={subtitle}
        className="mx-auto flex max-w-3xl flex-col items-center gap-5 sm:gap-6"
      />

      {/* Search card sits below the text with generous spacing */}
      <div className="mt-10 w-full sm:mt-14 lg:mt-16">
        <SearchCard className="mx-auto" />
      </div>
    </section>
  );
}
