import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { focusRingLoose } from "@/lib/styles";

type BrandLogoProps = {
  /** "link" for the navbar logo; "text" for footer and static mentions. */
  variant?: "link" | "text";
  className?: string;
  onNavigate?: () => void;
  /** Hides the mark and shows the wordmark alone (tight spaces). */
  markless?: boolean;
};

const brandStyles =
  "text-xl font-bold tracking-tight text-brand-700 motion-safe:transition-colors motion-safe:duration-200";

/**
 * GlooconnMark — the Glooconn tile logo.
 * Served from /public/brand so the same file is reusable in emails and docs.
 * Decorative here: the adjacent wordmark carries the accessible name.
 */
function GlooconnMark() {
  return (
    <Image
      src="/brand/glooconn-logo.png"
      alt=""
      width={64}
      height={64}
      className="h-8 w-8 shrink-0 rounded-lg"
      priority
    />
  );
}

/**
 * BrandLogo — the Glooconn mark and wordmark used in the navbar and footer.
 * Keeps brand styling in one place.
 */
export function BrandLogo({
  variant = "link",
  className,
  onNavigate,
  markless = false,
}: BrandLogoProps) {
  const content = (
    <>
      {!markless && <GlooconnMark />}
      <span>Glooconn</span>
    </>
  );

  if (variant === "text") {
    return (
      <p className={cn("flex items-center gap-2", brandStyles, className)}>
        {content}
      </p>
    );
  }

  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-2 rounded-lg hover:text-brand-800",
        brandStyles,
        focusRingLoose,
        className,
      )}
      onClick={onNavigate}
    >
      {content}
    </Link>
  );
}
