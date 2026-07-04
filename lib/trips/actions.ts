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

/** Saves a trip from search results. Redirects to login when unauthenticated. */
export async function saveTripAction(
  searchData: SearchData,
  redirectTo = "/my-trips",
): Promise<TripActionResult> {
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

/** Removes a saved trip and refreshes the My Trips page. */
export async function deleteTripAction(tripId: string): Promise<TripActionResult> {
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
