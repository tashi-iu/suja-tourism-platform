import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import { supabaseAdmin } from "~/services/supabase.server";

export type Profile = {
  name: string;
  avatar_url: string;
  id: string;
  role: string;
  location: string;
};

export async function getProfile(
  userId: string
): Promise<PostgrestSingleResponse<Profile>> {
  return supabaseAdmin.from("profiles").select().eq("id", userId).single();
}

export async function updateProfile(
  userId: string,
  profile: Omit<Partial<Profile>, "id">
) {
  return supabaseAdmin
    .from("profiles")
    .update(profile)
    .match({
      id: userId,
    })
    .single();
}
