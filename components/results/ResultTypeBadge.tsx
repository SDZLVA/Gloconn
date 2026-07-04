import { cn } from "@/lib/utils";
import type { ResultType } from "@/types/results";
import { RESULT_TYPE_LABELS } from "@/types/results";

const badgeStyles: Record<ResultType, string> = {
  hotel: "bg-violet-100 text-violet-800",
  flight: "bg-sky-100 text-sky-800",
  bus: "bg-amber-100 text-amber-800",
  train: "bg-emerald-100 text-emerald-800",
};

type ResultTypeBadgeProps = {
  type: ResultType;
  className?: string;
};

/** Small pill badge showing the result transport type. */
export function ResultTypeBadge({ type, className }: ResultTypeBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide",
        badgeStyles[type],
        className,
      )}
    >
      {RESULT_TYPE_LABELS[type].slice(0, -1)}
    </span>
  );
}
