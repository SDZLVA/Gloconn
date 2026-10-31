"use client";

import type { FlightLinksResolver } from "@/lib/affiliate/exactFlightLinks";
import { useId, useState } from "react";
import { PackageDetailsDrawer } from "@/components/results/PackageDetailsDrawer";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { TravelPackage } from "@/types/models/travel-package";

type ViewPackageDetailsActionProps = {
  package: TravelPackage;
  className?: string;
  originIata?: string | null;
  destinationIata?: string | null;
  /** Milestone 19: partner search link for this trip's flight route. */
  getFlightLinks?: FlightLinksResolver;
  tripType?: "round-trip" | "one-way" | null;
  /** Milestone 32: button text and style (redesign uses a solid "View package"). */
  label?: string;
  variant?: "primary" | "secondary";
};

/**
 * Primary package CTA — opens package details (flight + hotel).
 * Always available; hotel deep links appear only when details exist.
 */
export function ViewPackageDetailsAction({
  package: travelPackage,
  className,
  originIata,
  destinationIata,
  getFlightLinks,
  tripType,
  label = "View package details",
  variant = "secondary",
}: ViewPackageDetailsActionProps) {
  const [open, setOpen] = useState(false);
  const triggerId = useId();

  return (
    <>
      <Button
        id={triggerId}
        type="button"
        variant={variant}
        className={cn("min-h-11 min-w-11 px-4 py-2.5", className)}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {label}
      </Button>
      <PackageDetailsDrawer
        package={travelPackage}
        open={open}
        onClose={() => setOpen(false)}
        triggerId={triggerId}
        originIata={originIata}
        destinationIata={destinationIata}
        getFlightLinks={getFlightLinks}
        tripType={tripType}
      />
    </>
  );
}
