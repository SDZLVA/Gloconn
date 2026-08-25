"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { PackageDetailsPanel } from "@/components/results/PackageDetailsPanel";
import { fetchHotelPropertyDetails } from "@/lib/api/hotelDetailsClient";
import { canOpenHotelDetails } from "@/components/results/ViewHotelAction";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import type { HotelPropertyDetails } from "@/types/models/hotel-property-details";
import type { TravelPackage } from "@/types/models/travel-package";

export type PackageDetailsDrawerProps = {
  package: TravelPackage;
  open: boolean;
  onClose: () => void;
  triggerId?: string;
  originIata?: string | null;
  destinationIata?: string | null;
  tripType?: "round-trip" | "one-way" | null;
};

type DetailsStatus = "idle" | "loading" | "success" | "error";

/**
 * Package details drawer (Sprint 17.7).
 * Fetches hotel property details on open when a sealed ref exists.
 */
export function PackageDetailsDrawer({
  package: travelPackage,
  open,
  onClose,
  triggerId,
  originIata,
  destinationIata,
  tripType,
}: PackageDetailsDrawerProps) {
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const [details, setDetails] = useState<HotelPropertyDetails | null>(null);
  const [detailsStatus, setDetailsStatus] = useState<DetailsStatus>("idle");
  const requestIdRef = useRef(0);
  const hotel = travelPackage.hotel;

  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) {
      return;
    }

    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const frame = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKeyDown);
      const restoreTarget =
        (triggerId ? document.getElementById(triggerId) : null) ??
        previouslyFocusedRef.current;
      restoreTarget?.focus?.();
    };
  }, [open, onClose, triggerId]);

  useEffect(() => {
    if (!open) {
      setDetails(null);
      setDetailsStatus("idle");
      return;
    }

    if (!canOpenHotelDetails(hotel)) {
      setDetails(null);
      setDetailsStatus("idle");
      return;
    }

    const requestId = ++requestIdRef.current;
    setDetailsStatus("loading");

    void fetchHotelPropertyDetails({
      hotelId: hotel.id,
      ref: hotel.providerPropertyRef,
    }).then((result) => {
      if (requestId !== requestIdRef.current) {
        return;
      }
      if (result.success) {
        setDetails(result.data.details);
        setDetailsStatus("success");
        return;
      }
      setDetails(null);
      setDetailsStatus("error");
    });
  }, [open, hotel.id, hotel.providerPropertyRef]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-stretch sm:justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40 motion-safe:transition-opacity"
        aria-label="Close package details"
        onClick={onClose}
      />
      <PackageDetailsPanel
        package={travelPackage}
        onClose={onClose}
        titleId={titleId}
        closeButtonRef={closeButtonRef}
        originIata={originIata}
        destinationIata={destinationIata}
        tripType={tripType}
        details={details}
        detailsStatus={detailsStatus}
      />
    </div>,
    document.body,
  );
}
