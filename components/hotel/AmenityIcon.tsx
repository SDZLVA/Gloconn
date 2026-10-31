/** Milestone 33 — a small line icon for common hotel facilities. */
const ICONS: [RegExp, string][] = [
  [/wi-?fi|internet/i, "M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 19.5h.01"],
  [/air.?cond/i, "M12 2v20M4.9 4.9l14.2 14.2M2 12h20M4.9 19.1 19.1 4.9"],
  [/restaurant|dining/i, "M7 2v9a2 2 0 0 0 2 2v9M7 2v6M11 2v6M17 2c-2 2-2 6 0 8v12"],
  [/bar|lounge/i, "M5 3h14l-7 9v7m-4 2h8"],
  [/24|front desk|reception/i, "M12 7v5l3 2M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z"],
  [/smok/i, "M3 3l18 18M2 15h12v4H2zM18 15h1v4h-1M22 15v4"],
  [/park/i, "M5 21V3h7a5 5 0 0 1 0 10H5"],
  [/pool/i, "M2 18c2 0 2-1.5 4-1.5S8 18 10 18s2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5M8 15V5a2 2 0 0 1 4 0M16 15V5a2 2 0 0 0-4 0"],
  [/fitness|gym/i, "M6 6v12M18 6v12M3 9v6M21 9v6M6 12h12"],
  [/spa|sauna|massage/i, "M12 21c-5 0-8-3-8-7 3 0 6 1 8 4 2-3 5-4 8-4 0 4-3 7-8 7Zm0-3V9m0 0c-2-2-2-5 0-7 2 2 2 5 0 7Z"],
  [/pet/i, "M11 14c-3 0-5 2-5 4s2 2 5 2 5 0 5-2-2-4-5-4ZM6 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm12 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM9 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm6 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"],
  [/breakfast/i, "M3 10h14v4a6 6 0 0 1-12 0v-4Zm14 1h2a2 2 0 0 1 0 4h-2"],
  [/elevator|lift/i, "M6 2h12v20H6zM10 9l2-2 2 2M10 15l2 2 2-2"],
  [/laundry/i, "M4 3h16v18H4zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM7 6h.01"],
  [/shuttle|airport|transfer/i, "M3 17V7a2 2 0 0 1 2-2h11l5 5v7H3Zm4 0a2 2 0 1 0 4 0m4 0a2 2 0 1 0 4 0"],
];

export function AmenityIcon({ name, className = "h-5 w-5" }: { name: string; className?: string }) {
  const path = ICONS.find(([pattern]) => pattern.test(name))?.[1] ?? "M5 12l4 4 10-10";
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

/** Puts the facilities travellers look for first. */
export function topAmenities(facilities: string[], limit = 9): string[] {
  const priority = ICONS.map(([pattern]) => pattern);
  const scored = facilities.map((name) => {
    const i = priority.findIndex((p) => p.test(name));
    return { name, score: i === -1 ? 99 : i };
  });
  return scored.sort((a, b) => a.score - b.score).slice(0, limit).map((s) => s.name);
}
