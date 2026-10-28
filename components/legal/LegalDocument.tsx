import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { formatLegalDate } from "@/lib/legal/constants";

type LegalDocumentProps = {
  title: string;
  description: string;
  lastUpdated: string;
  children: React.ReactNode;
};

/**
 * LegalDocument — shared shell for the privacy policy and terms pages.
 * Keeps both documents visually consistent and readable on phones.
 */
export function LegalDocument({
  title,
  description,
  lastUpdated,
  children,
}: LegalDocumentProps) {
  return (
    <PageContainer className="py-10 sm:py-14">
      <article className="mx-auto max-w-3xl">
        <SectionHeading as="h1" title={title} description={description} />
        <p className="mt-4 text-sm text-slate-500">
          Last updated: {formatLegalDate(lastUpdated)}
        </p>
        <div className="mt-8 space-y-8">{children}</div>
      </article>
    </PageContainer>
  );
}

/** One numbered section of a legal document. */
export function LegalSection({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
        {heading}
      </h2>
      <div className="space-y-3 text-sm leading-relaxed text-slate-700 sm:text-base sm:leading-7">
        {children}
      </div>
    </section>
  );
}

/** Bulleted list with consistent spacing inside a legal section. */
export function LegalList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="ml-5 list-disc space-y-2">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}
