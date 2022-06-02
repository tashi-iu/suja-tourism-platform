import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import { supabaseAdmin } from "~/services/supabase.server";

export type Profile = {
  name: string;
  avatar_url: string;
  id: string;
  role: string;
  location: string;
  email: string;
};

export async function getProfile(
  userId: string
): Promise<PostgrestSingleResponse<Profile>> {
  return supabaseAdmin.from("profiles").select().eq("id", userId).single();
}

export async function updateProfile(
  profile: Partial<Profile>
) {
  return supabaseAdmin
    .from("profiles")
    .upsert({
      ...profile,
    }, {
      onConflict: 'id',
    })
    .match({
      id: profile.id,
    })
    .single();
}
