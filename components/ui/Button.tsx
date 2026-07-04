import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Visual style — "primary" is the main blue action button. */
  variant?: "primary" | "secondary";
};

/**
 * Button — a reusable styled button used across the app.
 *
 * Pass `type="button"` when the button is not submitting a form
 * (prevents accidental page reloads).
 */
export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold tracking-wide motion-safe:transition-all motion-safe:duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" &&
          "bg-brand-700 text-white shadow-md shadow-brand-700/20 motion-safe:hover:-translate-y-0.5 motion-safe:hover:bg-brand-800 motion-safe:hover:shadow-lg motion-safe:active:translate-y-0",
        variant === "secondary" &&
          "border border-slate-200 bg-white text-slate-700 motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-slate-300 motion-safe:hover:bg-slate-50 motion-safe:hover:shadow-sm motion-safe:active:translate-y-0",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
