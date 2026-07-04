import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/auth/server";

/** Signs the user out and clears the Supabase session cookie. */
export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { origin } = new URL(request.url);

  if (supabase) {
    await supabase.auth.signOut();
  }

  return NextResponse.redirect(`${origin}/`, {
    status: 302,
  });
}
