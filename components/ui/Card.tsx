import { cn } from "@/lib/utils";

type CardProps = {
  children: React.ReactNode;
  className?: string;
  /** Adds a subtle lift animation when hovered (disabled if user prefers reduced motion). */
  hoverable?: boolean;
};

/**
 * Card — a reusable rounded container with shadow.
 *
 * Used for panels like the search form. Pass `hoverable` to add a gentle
 * lift effect on mouse hover.
 */
export function Card({ children, className, hoverable = false }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-slate-200/70 bg-white shadow-lg shadow-slate-200/40",
        hoverable &&
          "motion-safe:transition-all motion-safe:duration-300 motion-safe:ease-out motion-safe:hover:-translate-y-1 motion-safe:hover:border-slate-300/80 motion-safe:hover:shadow-xl motion-safe:hover:shadow-slate-300/50",
        className,
      )}
    >
      {children}
    </div>
  );
}
