import { ExternalContinueLink } from "@/components/results/ExternalContinueLink";
import type { FlightPartnerLink } from "@/lib/affiliate/flightPartnerLink";

type PartnerLinksProps = {
  links: readonly FlightPartnerLink[];
  /** Packages add that the link covers the flight only. */
  context: "flight" | "package";
};

/**
 * Partner search buttons (Milestone 19). Every link opens a search for the
 * route and dates — never a specific flight — so the copy says exactly
 * that, and discloses commission whenever any link carries the marker.
 */
export function PartnerLinks({ links, context }: PartnerLinksProps) {
  if (links.length === 0) {
    return null;
  }

  const names = links.map((link) => link.partnerName).join(" and ");
  const anyTagged = links.some((link) => link.tagged);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs leading-relaxed text-slate-500">
        Opens a search for this route and dates on {names}.
        {context === "package" && " It covers the flight only, not the hotel."} Their
        flights and prices may differ.
        {anyTagged && " Glooconn may earn a commission."}
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        {links.map((link) => (
          <ExternalContinueLink
            key={link.partnerName}
            href={link.href}
            variant="brand"
            sponsored={link.tagged}
          >
            Check on {link.partnerName}
          </ExternalContinueLink>
        ))}
      </div>
    </div>
  );
}
