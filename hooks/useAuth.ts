"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/auth/client";
import type { AuthUser } from "@/types/auth";

function mapUser(user: User): AuthUser {
  const metadata = user.user_metadata ?? {};

  return {
    id: user.id,
    email: user.email ?? "",
    displayName:
      (metadata.full_name as string | undefined) ??
      (metadata.name as string | undefined) ??
      user.email?.split("@")[0] ??
      "Traveler",
    avatarUrl: (metadata.avatar_url as string | undefined) ?? null,
    createdAt: user.created_at,
  };
}

/** Client-side auth state for the navbar and interactive auth UI. */
export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ? mapUser(data.user) : null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? mapUser(session.user) : null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}
