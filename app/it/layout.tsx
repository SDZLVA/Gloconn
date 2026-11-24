/** Milestone 90 — Italian section: marks the content as Italian for browsers and screen readers. */
export default function ItalianLayout({ children }: { children: React.ReactNode }) {
  return <div lang="it">{children}</div>;
}
