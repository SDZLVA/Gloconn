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
        "inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" &&
          "bg-brand-700 text-white hover:bg-brand-800 active:bg-brand-800",
        variant === "secondary" &&
          "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
