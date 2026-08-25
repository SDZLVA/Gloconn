"use client";

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
  tripType?: "round-trip" | "one-way" | null;
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
  tripType,
}: ViewPackageDetailsActionProps) {
  const [open, setOpen] = useState(false);
  const triggerId = useId();

  return (
    <>
      <Button
        id={triggerId}
        type="button"
        variant="secondary"
        className={cn("min-h-11 min-w-11 px-4 py-2.5", className)}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        View package details
      </Button>
      <PackageDetailsDrawer
        package={travelPackage}
        open={open}
        onClose={() => setOpen(false)}
        triggerId={triggerId}
        originIata={originIata}
        destinationIata={destinationIata}
        tripType={tripType}
      />
    </>
  );
}
