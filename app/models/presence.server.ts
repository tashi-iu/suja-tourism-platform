import { supabaseAdmin } from "~/services/supabase.server";
import { getPresenceWithStatus } from "~/utils";

const queryTable = () => supabaseAdmin.from<PresenceResponse>("presences");

export type PresenceRequest = {
  forced_offline: boolean;
  last_seen: Date;
  profile_id: string;
};

export type PresenceResponse = PresenceRequest & {
  status?: "online" | "offline";
};

export const setUserPresence = async (presence: PresenceRequest) => {
  return queryTable()
    .upsert(presence, {
      onConflict: "profile_id",
      returning: "minimal",
    })
    .match({
      profile_id: presence.profile_id,
    })
    .single();
};

export const getUserPresence = async (profileId: string) => {
  const res = await queryTable()
    .select("*")
    .match({
      profile_id: profileId,
    })
    .single();
  return {
    ...res,
    data: res.data ? getPresenceWithStatus(res.data) : null,
  };
};
