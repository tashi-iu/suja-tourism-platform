import { supabaseAdmin } from "~/services/supabase.server";

export type Follower = {
  follower_id: string;
  following_id: string;
};

export async function followUser(followingId: string, followerId: string) {
  return supabaseAdmin.from<Follower>("followers").upsert(
    {
      follower_id: followerId,
      following_id: followingId,
    },
    {
      onConflict: "follower_id, following_id",
      ignoreDuplicates: true,
      returning: "minimal",
    }
  );
}

export async function unfollowUser(followingId: string, followerId: string) {
  return supabaseAdmin
    .from<Follower>("followers")
    .delete({
      returning: "minimal",
    })
    .match({
      follower_id: followerId,
      following_id: followingId,
    });
}

export async function getFollowerCount(followingId: string) {
  const { count, error } = await supabaseAdmin
    .from<Follower>("followers")
    .select(undefined, {
      count: "estimated",
      head: true,
    })
    .filter("following_id", "eq", followingId);
  if (error?.message) throw new Error(error.message);
  return count ?? 0;
}

export async function getFollowingCount(followerId: string) {
  const { count, error } = await supabaseAdmin
    .from<Follower>("followers")
    .select(undefined, {
      count: "estimated",
      head: true,
    })
    .filter("follower_id", "eq", followerId);
  if (error?.message) throw new Error(error.message);
  return count ?? 0;
}

export async function checkUserFollowing(
  followerId: string,
  followingId: string,
) {
  const { count, error } = await supabaseAdmin
    .from<Follower>("followers")
    .select(undefined, {
      count: "estimated",
      head: true,
    })
    .match({
      follower_id: followerId,
      following_id: followingId,
    });
  if (error?.message) throw new Error(error.message);
  return (count ?? 0) > 0;
}
