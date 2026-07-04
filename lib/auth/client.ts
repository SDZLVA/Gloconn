import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/auth/env";

/**
 * Supabase client for Client Components (login forms, navbar, etc.).
 * Returns null when `.env.local` is not configured — auth features are disabled.
 */
export function createSupabaseBrowserClient(): SupabaseClient | null {
  const { url, anonKey, isConfigured } = getSupabaseEnv();

  if (!isConfigured) {
    return null;
  }

  return createBrowserClient(url, anonKey);
}
