/**
 * Supabase environment variables.
 * Centralized so every auth module reads the same values.
 */

export type SupabaseEnv = {
  url: string;
  anonKey: string;
  isConfigured: boolean;
};

export function getSupabaseEnv(): SupabaseEnv {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  return {
    url,
    anonKey,
    isConfigured: Boolean(url && anonKey),
  };
}
