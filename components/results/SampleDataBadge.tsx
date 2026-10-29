/**
 * "Example" pill for results built from sample data (Milestone 19).
 * Amber, not brand blue, so it reads as a caution rather than a feature.
 */
export function SampleDataBadge({ label = "Example" }: { label?: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold tracking-wide text-amber-900">
      {label}
    </span>
  );
}
