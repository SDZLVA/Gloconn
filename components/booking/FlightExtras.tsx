"use client";

import { useState } from "react";
import type { BagOption, SeatMap } from "@/features/duffel/map";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

export type Traveller = { id: string; name: string; type: "adult" | "child" | "infant" };
/** Chosen seat per `${segmentId}:${passengerId}`. */
export type SeatPicks = Record<string, { serviceId: string; designator: string }>;
/** Chosen quantity per bag service id. */
export type BagPicks = Record<string, number>;

const box = "rounded-2xl border border-slate-200 bg-white p-5";

/** Duffel branch — extra bags and seat choice on the booking page. */
export function FlightExtras({
  bags,
  seatMaps,
  travellers,
  currency,
  bagPicks,
  seatPicks,
  onBags,
  onSeats,
}: {
  bags: BagOption[];
  seatMaps: SeatMap[];
  travellers: Traveller[];
  currency: string;
  bagPicks: BagPicks;
  seatPicks: SeatPicks;
  onBags: (next: BagPicks) => void;
  onSeats: (next: SeatPicks) => void;
}) {
  const seated = travellers.filter((t) => t.type !== "infant");
  const groups = [...travellers.map((t) => ({ key: t.id, name: t.name })), { key: "*", name: "Any traveller" }]
    .map((g) => ({ ...g, options: bags.filter((b) => b.passengerId === g.key) }))
    .filter((g) => g.options.length > 0);

  return (
    <div className="space-y-6">
      <section className={box} aria-labelledby="extra-bags">
        <h2 id="extra-bags" className="text-base font-bold text-slate-900">
          Extra bags
        </h2>
        {groups.length === 0 ? (
          <p className="mt-1 text-sm text-slate-600">This airline doesn&apos;t sell extra bags online here. You can usually add them later on the airline&apos;s website.</p>
        ) : (
          <div className="mt-3 space-y-4">
            {groups.map((g) => (
              <div key={g.key}>
                <p className="text-sm font-semibold text-slate-800">{g.name}</p>
                <ul className="mt-2 divide-y divide-slate-100 rounded-xl border border-slate-200">
                  {g.options.map((b) => {
                    const qty = bagPicks[b.id] ?? 0;
                    const set = (n: number) => onBags({ ...bagPicks, [b.id]: Math.max(0, Math.min(b.maxQuantity, n)) });
                    return (
                      <li key={`${b.id}-${b.passengerId}`} className="flex flex-wrap items-center justify-between gap-3 px-3 py-2.5">
                        <div className="text-sm">
                          <p className="font-semibold text-slate-900">
                            {b.kind === "checked" ? "Checked bag" : "Cabin bag"}
                            {b.maxWeightKg ? ` · up to ${b.maxWeightKg} kg` : ""}
                          </p>
                          <p className="text-xs text-slate-500">
                            {b.covers} · {formatMoney(b.amount, b.currency)} each{b.maxQuantity > 1 ? ` · max ${b.maxQuantity}` : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button type="button" aria-label="One bag less" onClick={() => set(qty - 1)} disabled={qty === 0} className="h-9 w-9 rounded-full border border-slate-300 text-lg font-bold text-brand-700 disabled:opacity-40">
                            −
                          </button>
                          <span className="w-5 text-center font-bold text-slate-900" aria-live="polite">
                            {qty}
                          </span>
                          <button type="button" aria-label="One bag more" onClick={() => set(qty + 1)} disabled={qty >= b.maxQuantity} className="h-9 w-9 rounded-full border border-slate-300 text-lg font-bold text-brand-700 disabled:opacity-40">
                            +
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className={box} aria-labelledby="seats">
        <h2 id="seats" className="text-base font-bold text-slate-900">
          Choose your seats <span className="text-sm font-normal text-slate-500">(optional)</span>
        </h2>
        {seatMaps.length === 0 || seated.length === 0 ? (
          <p className="mt-1 text-sm text-slate-600">Seat choice isn&apos;t available for this flight here. The airline gives you a seat at check-in.</p>
        ) : (
          <SeatPicker maps={seatMaps} travellers={seated} currency={currency} picks={seatPicks} onChange={onSeats} />
        )}
      </section>
    </div>
  );
}

function SeatPicker({ maps, travellers, currency, picks, onChange }: { maps: SeatMap[]; travellers: Traveller[]; currency: string; picks: SeatPicks; onChange: (next: SeatPicks) => void }) {
  const [mapIndex, setMapIndex] = useState(0);
  const [who, setWho] = useState(travellers[0]?.id ?? "");
  const map = maps[Math.min(mapIndex, maps.length - 1)];
  const takenBy = new Map<string, string>();
  for (const t of travellers) {
    const pick = picks[`${map.segmentId}:${t.id}`];
    if (pick) takenBy.set(pick.designator, t.id);
  }
  const initials = (id: string) => String(travellers.findIndex((t) => t.id === id) + 1);

  function choose(designator: string, serviceId: string) {
    const key = `${map.segmentId}:${who}`;
    const next = { ...picks };
    if (next[key]?.designator === designator) delete next[key];
    else next[key] = { serviceId, designator };
    onChange(next);
    // Move on to the next traveller without a seat on this flight.
    const free = travellers.find((t) => t.id !== who && !next[`${map.segmentId}:${t.id}`]);
    if (free && next[key]) setWho(free.id);
  }

  return (
    <div className="mt-3 space-y-4">
      {maps.length > 1 && (
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Flights">
          {maps.map((m, i) => (
            <button
              key={m.segmentId}
              type="button"
              role="tab"
              aria-selected={i === mapIndex}
              onClick={() => setMapIndex(i)}
              className={cn("rounded-full border px-3 py-1.5 text-xs font-semibold", i === mapIndex ? "border-brand-700 bg-brand-700 text-white" : "border-slate-300 text-slate-700")}
            >
              {m.label}
            </button>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-2" aria-label="Choosing a seat for">
        {travellers.map((t, i) => {
          const pick = picks[`${map.segmentId}:${t.id}`];
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setWho(t.id)}
              aria-pressed={who === t.id}
              className={cn("rounded-xl border px-3 py-2 text-left text-xs", who === t.id ? "border-brand-700 bg-brand-50 ring-2 ring-brand-100" : "border-slate-300 bg-white")}
            >
              <span className="block font-bold text-slate-900">
                {i + 1}. {t.name}
              </span>
              <span className="text-slate-600">{pick ? `Seat ${pick.designator}` : "No seat chosen"}</span>
            </button>
          );
        })}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50 p-3">
        <div className="mx-auto w-max space-y-1">
          {map.rows.map((row) => (
            <div key={row.number} className="flex items-center gap-1">
              <span className="w-6 text-right text-[11px] font-semibold text-slate-400">{row.number}</span>
              {row.sections.map((section, si) => (
                <div key={si} className={cn("flex gap-1", si > 0 && "ml-4")}>
                  {section.map((el, ei) => {
                    if (el.kind !== "seat") return <span key={ei} className="h-8 w-8" aria-hidden="true" />;
                    const seat = el.seat;
                    const price = seat.prices.find((p) => p.passengerId === who);
                    const owner = takenBy.get(seat.designator);
                    const mine = owner === who;
                    const blocked = !price || (owner !== undefined && !mine);
                    return (
                      <button
                        key={ei}
                        type="button"
                        disabled={blocked}
                        onClick={() => price && choose(seat.designator, price.serviceId)}
                        title={price ? `${seat.designator} · ${price.amount === 0 ? "Free" : formatMoney(price.amount, price.currency)}` : `${seat.designator} · not available`}
                        aria-label={price ? `Seat ${seat.designator}, ${price.amount === 0 ? "free" : formatMoney(price.amount, price.currency)}` : `Seat ${seat.designator}, not available`}
                        className={cn(
                          "h-8 w-8 rounded-md border text-[10px] font-bold",
                          mine
                            ? "border-brand-700 bg-brand-700 text-white"
                            : owner
                              ? "border-slate-500 bg-slate-500 text-white"
                              : price
                                ? price.amount === 0
                                  ? "border-emerald-500 bg-white text-emerald-700 hover:bg-emerald-50"
                                  : "border-brand-600 bg-white text-brand-700 hover:bg-brand-50"
                                : "border-slate-200 bg-slate-200 text-slate-400",
                          seat.extraLegroom && price && !owner && "ring-1 ring-amber-400",
                        )}
                      >
                        {owner ? initials(owner) : seat.designator.replace(/^\d+/, "")}
                      </button>
                    );
                  })}
                </div>
              ))}
              {row.exit && <span className="ml-1 text-[10px] font-bold text-red-600">EXIT</span>}
            </div>
          ))}
        </div>
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
        <li><span className="mr-1 inline-block h-3 w-3 rounded border border-emerald-500 bg-white align-middle" />Free</li>
        <li><span className="mr-1 inline-block h-3 w-3 rounded border border-brand-600 bg-white align-middle" />Paid (price in the summary below{currency ? ` · ${currency}` : ""})</li>
        <li><span className="mr-1 inline-block h-3 w-3 rounded bg-brand-700 align-middle" />Your pick</li>
        <li><span className="mr-1 inline-block h-3 w-3 rounded bg-slate-200 align-middle" />Taken</li>
      </ul>
    </div>
  );
}
