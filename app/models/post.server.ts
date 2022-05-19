import type { User } from "@supabase/supabase-js";
import { supabaseAdmin } from "~/services/supabase.server";
import type { Profile } from "./profile.server";

export type Post = {
  id: string;
  body: string;
  image_urls: string[];
  created_at: Date;
  updated_at: Date;
  profile_id: string;
  creator: Profile;
};

export async function getPosts(
  clientQuery: { userId?: User["id"]; page?: number } = {}
) {
  const query = supabaseAdmin.from<Post>("posts").select(`
      id,
      body,
      creator:profiles
    `);

  if (clientQuery.userId) {
    query.eq("profile_id", clientQuery.userId);
  }

  query.range(
    clientQuery.page ? 10 * clientQuery.page : 0,
    clientQuery.page ? 10 * clientQuery.page + 10 : 10
  );

  const { data } = await query.limit(15).order("created_at", {
    ascending: false,
  });

  return data;
}

export async function createPost({
  body,
  userId,
  imageUrls,
}: Pick<Post, "body"> & { userId: User["id"]; imageUrls?: string[] }): Promise<{
  post?: Post;
  error?: string;
}> {
  const { data, error } = await supabaseAdmin
    .from("posts")
    .insert([{ body, profile_id: userId, image_urls: imageUrls ?? [] }])
    .single();

  if (!error) {
    return data;
  }

  return { error: error.message };
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
