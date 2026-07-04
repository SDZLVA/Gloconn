import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  title: string;
  description?: string;
  /** HTML id for the heading — useful for aria-labelledby on parent sections. */
  id?: string;
  /** Heading level — use h1 for page heroes, h2 for cards and sections. */
  as?: "h1" | "h2" | "h3";
  align?: "left" | "center";
  className?: string;
};

const titleStyles = {
  h1: "text-balance text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl sm:leading-tight lg:text-5xl lg:leading-[1.1]",
  h2: "text-lg font-bold tracking-tight text-slate-900 sm:text-xl",
  h3: "text-base font-bold tracking-tight text-slate-900 sm:text-lg",
} as const;

const descriptionStyles = {
  h1: "max-w-2xl text-pretty text-base leading-relaxed text-slate-600 sm:text-lg sm:leading-8",
  h2: "text-sm leading-relaxed text-slate-600 sm:text-base",
  h3: "text-sm leading-relaxed text-slate-600",
} as const;

/**
 * SectionHeading — reusable title and optional description for page sections.
 *
 * Used in hero areas, cards, and content blocks so heading styles stay consistent.
 */
export function SectionHeading({
  title,
  description,
  id,
  as: Heading = "h2",
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      <Heading id={id} className={titleStyles[Heading]}>
        {title}
      </Heading>
      {description && (
        <p className={descriptionStyles[Heading]}>{description}</p>
      )}
    </div>
  );
}
