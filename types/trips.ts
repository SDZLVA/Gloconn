/**
 * Saved trip types — persisted per user in Supabase.
 */

import type { SearchData } from "@/types/search";

export type SavedTrip = {
  id: string;
  userId: string;
  title: string;
  searchData: SearchData;
  createdAt: string;
};

export type SavedTripRow = {
  id: string;
  user_id: string;
  title: string;
  search_data: SearchData;
  created_at: string;
};
