/**
 * Milestone 34 — worldwide places the traveller picked, kept in this browser
 * so "Recent searches" can show them again (the catalog only knows ~25).
 */

import type { Destination } from "@/types/models/destination";

const KEY = "glooconn:world-places";

function readAll(): Record<string, Destination> {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? (parsed as Record<string, Destination>) : {};
  } catch {
    return {};
  }
}

export function rememberWorldPlace(destination: Destination): void {
  try {
    const all = readAll();
    all[destination.id] = destination;
    const ids = Object.keys(all);
    for (const id of ids.slice(0, Math.max(0, ids.length - 50))) delete all[id];
    window.localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
}

export function getWorldPlace(id: string): Destination | null {
  if (typeof window === "undefined") return null;
  return readAll()[id] ?? null;
}
