import { supabaseAdmin } from "~/services/supabase.server";

const tableQuery = supabaseAdmin.from<Message>("messages");

export type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  created_at: Date;
  updated_at: Date;
  text: string;
  image_urls: string[];
  voice_url: string;
};

export const sendMessage = (payload: Partial<Message>) => {
  return tableQuery.insert(payload).single();
};

export const deleteMessage = (id: string) => {
  return tableQuery
    .delete({
      returning: "minimal",
    })
    .eq("id", id)
    .single();
};

export const getMessage = (id: string) => {
  return tableQuery.select("*").eq("id", id).single();
};

export const getMessagesForConversation = (
  userId: string,
  receipientId: string
) => {
  return tableQuery
    .select("*")
    .or(
      `and(sender_id.eq.${userId},receiver_id.eq.${receipientId}),and(sender_id.eq.${receipientId},receiver_id.eq.${userId})`
    )
    .limit(10)
    .order("created_at", { ascending: true });
};
