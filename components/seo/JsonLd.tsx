import { serializeJsonLd, type JsonLdObject } from "@/lib/seo/jsonld";

/** Milestone 72 — emits schema.org structured data. A data block (not executable), so the CSP nonce does not apply. */
export function JsonLd({ data }: { data: JsonLdObject | JsonLdObject[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}
