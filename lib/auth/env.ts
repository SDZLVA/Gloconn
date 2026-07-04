/**
 * Supabase environment — backward-compatible re-export from centralized config.
 * @deprecated Prefer `getAppConfig().supabase` from `@/lib/config`.
 */

import { getAppConfig, type SupabaseConfig } from "@/lib/config";

export type SupabaseEnv = SupabaseConfig;

export function getSupabaseEnv(): SupabaseEnv {
  return getAppConfig().supabase;
}
