import { createSupabaseServerClient } from "@/lib/auth/server";
import { requireUser } from "@/lib/auth/session";
import { buildTripTitle, mapSavedTripRow } from "@/lib/trips/format";
import type { SearchData } from "@/types/search";
import type { SavedTrip } from "@/types/trips";

/** Fetches all saved trips for the signed-in user, newest first. */
export async function getSavedTripsForUser(): Promise<SavedTrip[]> {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    throw new Error("Authentication is not configured.");
  }

  const { data, error } = await supabase
    .from("saved_trips")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapSavedTripRow);
}

/** Saves a trip for the signed-in user. Returns the new trip id. */
export async function saveTripForUser(
  searchData: SearchData,
): Promise<string> {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    throw new Error("Authentication is not configured.");
  }

  const { data, error } = await supabase
    .from("saved_trips")
    .insert({
      user_id: user.id,
      title: buildTripTitle(searchData),
      search_data: searchData,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data.id;
}

/** Deletes a saved trip owned by the signed-in user. */
export async function deleteTripForUser(tripId: string): Promise<void> {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    throw new Error("Authentication is not configured.");
  }

  const { error } = await supabase
    .from("saved_trips")
    .delete()
    .eq("id", tripId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }
}
