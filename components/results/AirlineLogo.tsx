"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Airline logo (Milestone 21): Aviasales' square airline icons,
 *   https://pics.avs.io/al_square/<w>/<h>/<IATA>.png
 * (checked 2026-10-29: FR, U2, EN, VF, ZQ all return 96×96 icons; the
 * img.wway.io service returns wide wordmarks, unreadable at this size).
 * Allowed by img-src in lib/security/csp.ts. Invalid code or a failed load
 * → a neutral plane mark; never a guessed logo.
 */
const LOGO_BASE = "https://pics.avs.io/al_square/96/96";

export function airlineLogoUrl(code: string): string {
  return `${LOGO_BASE}/${encodeURIComponent(code)}.png`;
}

export function PlaneMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn("h-4 w-4 fill-current", className)}>
      <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" />
    </svg>
  );
}

type AirlineLogoProps = {
  code?: string;
  name?: string;
  className?: string;
};

export function AirlineLogo({ code, name, className }: AirlineLogoProps) {
  const [failed, setFailed] = useState(false);
  const usable = Boolean(code && /^[A-Z0-9]{2}$/.test(code)) && !failed;

  return (
    <span
      className={cn(
        "flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-slate-200",
        className,
      )}
    >
      {usable ? (
        // eslint-disable-next-line @next/next/no-img-element -- tiny remote logo; next/image adds nothing here
        <img
          src={airlineLogoUrl(code as string)}
          alt={name ? `${name} logo` : ""}
          width={44}
          height={44}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="h-full w-full object-contain p-1"
          onError={() => setFailed(true)}
        />
      ) : (
        <PlaneMark className="h-5 w-5 text-slate-400" />
      )}
    </span>
  );
}
