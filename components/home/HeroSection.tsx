import { SearchCard } from "@/components/ui/SearchCard";
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
        "relative flex flex-col items-center overflow-hidden rounded-2xl px-4 py-14 text-center sm:px-8 sm:py-16 lg:py-20",
        className,
      )}
    >
      {/* Soft travel-themed gradient behind the content */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-brand-50 via-sky-50/80 to-transparent"
        aria-hidden="true"
      />

      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 sm:gap-5">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
          {subtitle}
        </p>
      </div>

      {/* Search card sits below the text with generous spacing */}
      <div className="mt-10 w-full sm:mt-12 lg:mt-14">
        <SearchCard className="mx-auto" />
      </div>
    </section>
  );
}
