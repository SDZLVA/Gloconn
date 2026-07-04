import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "@/lib/auth/env";

/**
 * Supabase client for Server Components, Server Actions, and Route Handlers.
 * Returns null when `.env.local` is not configured — auth features are disabled.
 */
export async function createSupabaseServerClient(): Promise<SupabaseClient | null> {
  const { url, anonKey, isConfigured } = getSupabaseEnv();

  if (!isConfigured) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // `setAll` can fail in Server Components — middleware keeps sessions fresh.
        }
      },
    },
  });
}
