import { cn } from "@/lib/utils";
import type { ResultType } from "@/types/results";

const gradientStyles: Record<ResultType, string> = {
  hotel: "from-violet-400 to-purple-600",
  flight: "from-sky-400 to-blue-600",
  bus: "from-amber-400 to-orange-500",
  train: "from-emerald-400 to-teal-600",
};

const iconPaths: Record<ResultType, string> = {
  hotel: "M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6",
  flight: "M2 12h5l3-9 4 18 3-9h5",
  bus: "M8 6v6M16 6v6M3 18h18M5 18l1-8h12l1 8M7 18v2M17 18v2",
  train: "M4 15h16M4 11h16M6 19h2M16 19h2M8 7h8l2 6H6l2-6z",
};

type ResultPlaceholderImageProps = {
  type: ResultType;
  label?: string;
  className?: string;
};

/** Gradient placeholder with a simple icon until real images are added. */
export function ResultPlaceholderImage({
  type,
  label,
  className,
}: ResultPlaceholderImageProps) {
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br",
        gradientStyles[type],
        className,
      )}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-10 w-10 text-white/80"
      >
        <path d={iconPaths[type]} />
      </svg>
      {label && (
        <span className="absolute bottom-2 left-2 right-2 truncate text-center text-xs font-semibold text-white/90">
          {label}
        </span>
      )}
    </div>
  );
}
