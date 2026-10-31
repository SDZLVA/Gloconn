import { ExternalContinueLink } from "@/components/results/ExternalContinueLink";
import type { FlightPartnerLink } from "@/lib/affiliate/flightPartnerLink";

type PartnerLinksProps = {
  links: readonly FlightPartnerLink[];
  /** Packages add that the link covers the flights only. */
  context: "flight" | "package";
};

function describe(link: FlightPartnerLink): string {
  if (!link.exact) {
    return `a search for this route and dates on ${link.partnerName}`;
  }
  return link.partnerName === "Aviasales"
    ? "these exact flights on Aviasales"
    : "Kiwi.com, filtered to the same airline and departure times";
}

function label(link: FlightPartnerLink): string {
  if (!link.exact) return `Check on ${link.partnerName}`;
  return link.partnerName === "Aviasales" ? "View these flights on Aviasales" : "Find them on Kiwi.com";
}

/**
 * Partner buttons. Milestone 19 links opened a route search; Milestone 20
 * links open the exact flights (Aviasales) or a search filtered down to
 * them (Kiwi.com). The copy says which, and discloses commission whenever
 * any link can earn it (see /terms, section 6).
 */
export function PartnerLinks({ links, context }: PartnerLinksProps) {
  if (links.length === 0) {
    return null;
  }

  const kiwiExact = links.some((link) => link.exact && link.partnerName === "Kiwi.com");
  const anyGeneral = links.some((link) => !link.exact);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs leading-relaxed text-slate-500">
        Opens {links.map(describe).join(", and ")}.
        {context === "package" && " It covers the flights only, not the hotel."}
        {kiwiExact && " Kiwi.com may not sell the same flights."}
        {anyGeneral ? " Their flights and prices may differ." : " Prices may have changed."}
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        {links.map((link) => (
          <ExternalContinueLink
            key={link.partnerName}
            href={link.href}
            variant="brand"
            sponsored={link.tagged}
          >
            {label(link)}
          </ExternalContinueLink>
        ))}
      </div>
    </div>
  );
}
