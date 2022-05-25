import { supabaseAdmin } from "~/services/supabase.server";
import type { Post } from "./post.server";
import type { Profile } from "./profile.server";

export type Like = {
  id: number;
  profile_id: Profile["id"];
  created_at: Date;
  post_id: Post["id"];
};

export async function getLikeCount(clientQuery: { postId: Like["post_id"] }) {
  const query = supabaseAdmin
    .from<Like>("likes")
    .select(undefined, { head: true, count: "estimated" })
    .match({
      post_id: clientQuery.postId,
    });

  const { count } = await query;

  return count;
}

export async function getHasUserLiked(clientQuery: {
  postId: Like["post_id"];
  userId: Like["profile_id"];
}) {
  const query = supabaseAdmin
    .from<Like>("likes")
    .select("profile_id, post_id", {
      count: "exact",
      head: true,
    })
    .match({
      profile_id: clientQuery.userId,
      post_id: clientQuery.postId,
    });

  const { count } = await query;
  return !!count;
}

export async function updatePostLiked(clientQuery: {
  liked: boolean;
  postId: string;
  userId: string;
}) {
  const query = supabaseAdmin.from<Like>("likes");

  const filter = clientQuery.liked
    ? query.upsert(
        {
          post_id: clientQuery.postId,
          profile_id: clientQuery.userId,
        },
        {
          returning: "minimal",
          onConflict: "profile_id, post_id",
          ignoreDuplicates: true,
        }
      )
    : query.delete({ returning: "minimal" }).match({
        post_id: clientQuery.postId,
        profile_id: clientQuery.userId,
      });
  const { error } = await filter
    .match({
      post_id: clientQuery.postId,
      profile_id: clientQuery.userId,
    })
    .single();
  if (error) {
    throw new Error(error.message);
  }
  return {
    done: true,
  };
}
