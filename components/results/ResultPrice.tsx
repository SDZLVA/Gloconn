import { formatBudget } from "@/lib/budget";
import { cn } from "@/lib/utils";
import type { CurrencyCode } from "@/lib/budget";

type ResultPriceProps = {
  price: number;
  currency: CurrencyCode;
  suffix?: string;
  className?: string;
};

/** Formatted price display for result cards. */
export function ResultPrice({
  price,
  currency,
  suffix,
  className,
}: ResultPriceProps) {
  return (
    <div className={cn("text-right", className)}>
      <p className="text-2xl font-bold tracking-tight text-slate-900">
        {formatBudget(price, currency)}
      </p>
      {suffix && (
        <p className="text-xs font-medium text-slate-500">{suffix}</p>
      )}
    </div>
  );
}
