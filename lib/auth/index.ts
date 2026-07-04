export {
  AUTH_ROUTES,
  DEFAULT_AUTH_REDIRECT,
  PROTECTED_ROUTES,
  REDIRECT_PARAM,
} from "@/lib/auth/constants";
export { createSupabaseBrowserClient } from "@/lib/auth/client";
export { getSupabaseEnv } from "@/lib/auth/env";
export { updateSession } from "@/lib/auth/middleware";
export { createSupabaseServerClient } from "@/lib/auth/server";
export { getCurrentUser, requireUser } from "@/lib/auth/session";
