"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { REDIRECT_PARAM } from "@/lib/auth/constants";
import { getCurrentUser } from "@/lib/auth/session";
import {
  deleteTripForUser,
  saveTripForUser,
} from "@/lib/trips/savedTrips";
import type { SearchData } from "@/types/search";

export type TripActionResult = {
  success: boolean;
  message: string;
};

/**
 * Saves a trip from search results to the signed-in user's account.
 *
 * Security (F-05): authentication is verified at this action level before
 * delegating to saveTripForUser. The inner function also calls requireUser()
 * and sets user_id from the server session in the INSERT — these remain as
 * defence-in-depth layers and are not removed.
 *
 * Unauthenticated callers are redirected to /login so they can sign in and
 * then return; no trip data reaches the database.
 */
export async function saveTripAction(
  searchData: SearchData,
  redirectTo = "/my-trips",
): Promise<TripActionResult> {
  // F-05: top-level auth guard — reject unauthenticated callers immediately.
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?${REDIRECT_PARAM}=${encodeURIComponent(redirectTo)}`);
  }

  try {
    await saveTripForUser(searchData);
    revalidatePath("/my-trips");
    return { success: true, message: "Trip saved to My Trips." };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not save this trip.";
    return { success: false, message };
  }
}

/**
 * Removes a saved trip and refreshes the My Trips page.
 *
 * Security (F-03): authentication is verified at this action level before
 * delegating to deleteTripForUser. The inner function also calls requireUser()
 * and applies a user_id equality filter in the database query — these remain
 * as defence-in-depth layers and are not removed.
 */
export async function deleteTripAction(tripId: string): Promise<TripActionResult> {
  // F-03: top-level auth guard — reject unauthenticated callers immediately.
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?${REDIRECT_PARAM}=${encodeURIComponent("/my-trips")}`);
  }

  try {
    await deleteTripForUser(tripId);
    revalidatePath("/my-trips");
    return { success: true, message: "Trip removed." };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not delete this trip.";
    return { success: false, message };
  }
}
