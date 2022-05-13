import type { User } from "@supabase/supabase-js";
import { supabaseAdmin } from "~/services/supabase.server";

export type Post = {
  id: string;
  title: string;
  body: string;
  image_url: string;
  profile_id: string;
};

export async function getPostListItems(
  clientQuery: { userId?: User["id"] } = {}
) {
  const query = supabaseAdmin.from<Post>("posts").select("id, title");

  if (clientQuery.userId) {
    query.eq("profile_id", clientQuery.userId);
  }

  const { data } = await query;

  return data;
}

export async function createPost({
  title,
  body,
  userId,
}: Pick<Post, "body" | "title"> & { userId: User["id"] }) {
  const { data, error } = await supabaseAdmin
    .from("posts")
    .insert([{ title, body, profile_id: userId }])
    .single();

  if (!error) {
    return data;
  }

  return null;
}

export async function deletePost({
  id,
  userId,
}: Pick<Post, "id"> & { userId: User["id"] }) {
  const { error } = await supabaseAdmin
    .from("posts")
    .delete({ returning: "minimal" })
    .match({ id, profile_id: userId });

  if (!error) {
    return {};
  }

  return null;
}

export async function getPost({
  id,
  userId,
}: Pick<Post, "id"> & { userId: User["id"] }) {
  const { data, error } = await supabaseAdmin
    .from("posts")
    .select("*")
    .eq("profile_id", userId)
    .eq("id", id)
    .single();

  if (!error) {
    return {
      userId: data.profile_id,
      id: data.id,
      title: data.title,
      body: data.body,
    };
  }

  return null;
}
