import "server-only";

/**
 * Milestone 49 — shared cache and usage counters (Supabase tables api_cache,
 * api_usage, api_visitors; see supabase/migrations/20261106000000_*). Needs
 * SUPABASE_SERVICE_ROLE_KEY (Vercel Secret, server only). Without it, every
 * claim answers "no", so the paid APIs are never called unguarded.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null | undefined;

function service(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  client = url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
  return client;
}

export function storeConfigured(): boolean {
  return service() !== null;
}

export async function readCache<T>(key: string): Promise<T | null> {
  const db = service();
  if (!db) return null;
  try {
    const { data } = await db.from("api_cache").select("value, expires_at").eq("key", key).maybeSingle();
    if (!data || new Date(data.expires_at as string).getTime() < Date.now()) return null;
    return data.value as T;
  } catch {
    return null;
  }
}

export async function writeCache(key: string, value: unknown, ttlMs: number): Promise<void> {
  const db = service();
  if (!db) return;
  try {
    await db.from("api_cache").upsert({ key, value, expires_at: new Date(Date.now() + ttlMs).toISOString() });
  } catch {
    /* cache is best-effort */
  }
}

/** Takes one call from the provider's allowance; false = over a cap (or no store). */
export async function claimCall(provider: string, daily: number, monthly: number): Promise<boolean> {
  const db = service();
  if (!db) return false;
  try {
    const { data, error } = await db.rpc("claim_api_call", { p_provider: provider, p_daily: daily, p_monthly: monthly });
    return !error && data === true;
  } catch {
    return false;
  }
}

/** Counts one paid lookup for this visitor today; false = over the visitor limit. */
export async function claimVisitor(visitor: string, limit: number): Promise<boolean> {
  const db = service();
  if (!db || !visitor) return false;
  try {
    const { data, error } = await db.rpc("claim_api_visitor", { p_visitor: visitor, p_limit: limit });
    return !error && data === true;
  } catch {
    return false;
  }
}
