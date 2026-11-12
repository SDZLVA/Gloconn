/**
 * Milestone 57 — small "still loading" line shown above results that are
 * already on screen while slower sources finish. When they arrive the list
 * is replaced and re-sorted by the current sort.
 */
export function LoadingMoreNote({ text }: { text: string }) {
  return (
    <p
      role="status"
      aria-live="polite"
      className="mb-3 flex items-center gap-2 rounded-xl border border-brand-100 bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand-800"
    >
      <span
        aria-hidden="true"
        className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-brand-100 border-t-brand-700 motion-reduce:animate-none"
      />
      {text}
    </p>
  );
}
