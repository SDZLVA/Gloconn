import Link from "next/link";
import { cn } from "@/lib/utils";
import { focusRingLoose } from "@/lib/styles";

type BrandLogoProps = {
  /** "link" for the navbar logo; "text" for footer and static mentions. */
  variant?: "link" | "text";
  className?: string;
  onNavigate?: () => void;
};

const brandStyles =
  "text-xl font-bold tracking-tight text-brand-700 motion-safe:transition-colors motion-safe:duration-200";

/**
 * BrandLogo — the Glooconn wordmark used in the navbar and footer.
 * Keeps brand styling in one place.
 */
export function BrandLogo({
  variant = "link",
  className,
  onNavigate,
}: BrandLogoProps) {
  if (variant === "text") {
    return <p className={cn(brandStyles, className)}>Glooconn</p>;
  }

  return (
    <Link
      href="/"
      className={cn(
        "rounded-lg hover:text-brand-800",
        brandStyles,
        focusRingLoose,
        className,
      )}
      onClick={onNavigate}
    >
      Glooconn
    </Link>
  );
}
