import { createSupabaseServerClient } from "@/lib/auth/server";
import type { AuthUser } from "@/types/auth";

/** Maps Supabase user metadata into the app's AuthUser shape. */
function toAuthUser(
  user: NonNullable<
    Awaited<ReturnType<Awaited<ReturnType<typeof createSupabaseServerClient>>["auth"]["getUser"]>>["data"]["user"]
  >,
): AuthUser {
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

/** Returns the signed-in user, or null when unauthenticated. */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  return toAuthUser(data.user);
}

/** Returns the signed-in user or throws — use in protected server code. */
export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Authentication required");
  }

  return user;
}
