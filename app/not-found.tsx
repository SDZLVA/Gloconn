import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { focusRingLoose } from "@/lib/styles";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Page not found — Glooconn",
};

/** Branded 404 page — keeps people moving instead of dead-ending. */
export default function NotFound() {
  return (
    <PageContainer className="py-16 sm:py-24">
      <div className="mx-auto max-w-xl text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-brand-700">
          404
        </p>
        <div className="mt-3">
          <SectionHeading
            as="h1"
            align="center"
            title="We couldn't find that page"
            description="The link may be old, or the page may have moved. Your trips and searches are unaffected."
          />
        </div>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className={cn(
              "inline-flex items-center justify-center rounded-xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white motion-safe:transition-colors hover:bg-brand-800",
              focusRingLoose,
            )}
          >
            Start a new search
          </Link>
          <Link
            href="/my-trips"
            className={cn(
              "inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 motion-safe:transition-colors hover:border-slate-300",
              focusRingLoose,
            )}
          >
            Go to My Trips
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}
