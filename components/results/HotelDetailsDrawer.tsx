"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { HotelDetailsPanel } from "@/components/results/HotelDetailsPanel";
import { fetchHotelPropertyDetails } from "@/lib/api/hotelDetailsClient";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import type { Hotel } from "@/types/models/hotel";
import type { HotelPropertyDetails } from "@/types/models/hotel-property-details";

export type HotelDetailsDrawerProps = {
  hotel: Hotel;
  open: boolean;
  onClose: () => void;
  /** Optional id of the control that opened the drawer (accessibility). */
  triggerId?: string;
};

type DetailsStatus = "idle" | "loading" | "success" | "error";

/**
 * Hotel investigation surface (Sprint 17.2 + 17.3).
 * Fetches property details only when opened — never on the search page.
 */
export function HotelDetailsDrawer({
  hotel,
  open,
  onClose,
  triggerId,
}: HotelDetailsDrawerProps) {
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const [details, setDetails] = useState<HotelPropertyDetails | null>(null);
  const [detailsStatus, setDetailsStatus] = useState<DetailsStatus>("idle");
  const requestIdRef = useRef(0);

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
      // Drop enriched payload when closed so the next open starts clean.
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
        aria-label="Close hotel details"
        onClick={onClose}
      />
      <HotelDetailsPanel
        hotel={hotel}
        onClose={onClose}
        titleId={titleId}
        closeButtonRef={closeButtonRef}
        details={details}
        detailsStatus={detailsStatus}
      />
    </div>,
    document.body,
  );
}
