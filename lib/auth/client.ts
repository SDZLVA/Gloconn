import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/auth/env";

/** Supabase client for Client Components (login forms, navbar, etc.). */
export function createSupabaseBrowserClient() {
  const { url, anonKey } = getSupabaseEnv();
  return createBrowserClient(url, anonKey);
}
