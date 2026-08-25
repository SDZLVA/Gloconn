import type { ReactNode } from "react";
import { focusRing } from "@/lib/styles";
import { cn } from "@/lib/utils";

export type ExternalContinueLinkProps = {
  href: string;
  children: ReactNode;
  /** Visual emphasis — Maps uses brand styling. */
  variant?: "brand" | "neutral";
};

/**
 * Shared external continue link for hotel / package detail drawers.
 * Callers must pass already-validated HTTPS URLs only.
 */
export function ExternalContinueLink({
  href,
  children,
  variant = "neutral",
}: ExternalContinueLinkProps) {
  const tone =
    variant === "brand"
      ? "border-slate-200 bg-white text-brand-800 motion-safe:hover:border-brand-200 motion-safe:hover:bg-brand-50"
      : "border-slate-200 bg-white text-slate-800 motion-safe:hover:border-slate-300 motion-safe:hover:bg-slate-50";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-xl border px-4 py-2.5 text-sm font-semibold",
        tone,
        focusRing,
      )}
    >
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
