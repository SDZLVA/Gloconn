import "server-only";

import { travelpayoutsLiteApiEngine } from "@/features/packagesEngine/engines/travelpayoutsLiteapi";
import type { PackagesEngine } from "@/features/packagesEngine/types";

/**
 * Milestone 40 — which packages engine runs (server env PACKAGES_ENGINE):
 *   "travelpayouts-liteapi" (default) — Travelpayouts flight prices + LiteAPI hotels;
 *   "legacy" — the older providers (FLIGHTS_PROVIDER / HOTELS_PROVIDER) and composer;
 *   "off" — no packages.
 * Add a new engine by writing one file in ./engines and listing it here.
 */
const ENGINES: PackagesEngine[] = [travelpayoutsLiteApiEngine];

export type PackagesEngineChoice = { kind: "engine"; engine: PackagesEngine } | { kind: "legacy" } | { kind: "off" };

export function activePackagesEngine(): PackagesEngineChoice {
  const value = (process.env.PACKAGES_ENGINE ?? "").trim().toLowerCase() || "travelpayouts-liteapi";
  if (value === "legacy") return { kind: "legacy" };
  if (value === "off") return { kind: "off" };
  const engine = ENGINES.find((item) => item.id === value);
  return engine ? { kind: "engine", engine } : { kind: "engine", engine: travelpayoutsLiteApiEngine };
}
