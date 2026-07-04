import { cn } from "@/lib/utils";

type SearchFormSectionProps = {
  id: string;
  title: string;
  children: React.ReactNode;
  className?: string;
};

/**
 * SearchFormSection — groups related fields with a visible label and accessible name.
 * Used inside `SearchForm` to organize Where / When / Details / Preferences.
 */
export function SearchFormSection({
  id,
  title,
  children,
  className,
}: SearchFormSectionProps) {
  return (
    <section
      role="group"
      aria-labelledby={id}
      className={cn("flex flex-col gap-4 sm:gap-5", className)}
    >
      <h3
        id={id}
        className="text-xs font-semibold uppercase tracking-wider text-slate-500"
      >
        {title}
      </h3>
      {children}
    </section>
  );
}

/** Subtle divider between form sections. */
export function SearchFormDivider() {
  return (
    <div
      className="h-px bg-slate-100"
      role="presentation"
      aria-hidden="true"
    />
  );
}
