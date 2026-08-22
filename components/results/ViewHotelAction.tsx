"use client";

import { useId, useState } from "react";
import { HotelDetailsDrawer } from "@/components/results/HotelDetailsDrawer";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { Hotel } from "@/types/models/hotel";

type ViewHotelActionProps = {
  hotel: Hotel;
  className?: string;
};

/**
 * True when the hotel carries a sealed details reference (`gpref1.…`).
 * Without it, details cannot be fetched securely (Sprint 17.5.2).
 */
export function canOpenHotelDetails(hotel: Hotel): boolean {
  const ref = hotel.providerPropertyRef?.trim() ?? "";
  return ref.startsWith("gpref1.");
}

/**
 * Single primary hotel CTA — shared by package + browse hotel cards.
 * Opens Glooconn's hotel details drawer (not booking).
 * Hidden when no sealed providerPropertyRef is available.
 * Touch target ≥ 44×44px (Sprint 17.4).
 */
export function ViewHotelAction({ hotel, className }: ViewHotelActionProps) {
  const [open, setOpen] = useState(false);
  const triggerId = useId();

  if (!canOpenHotelDetails(hotel)) {
    return null;
  }

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
        View hotel
      </Button>
      <HotelDetailsDrawer
        hotel={hotel}
        open={open}
        onClose={() => setOpen(false)}
        triggerId={triggerId}
      />
    </>
  );
}
