import type { Params } from "react-router";
import { getFollowerCount, getFollowingCount } from "./models/follower.server";
import { getHasUserLiked, getLikeCount } from "./models/like.server";
import { getPostCountForUser, getPosts } from "./models/post.server";
import { authCookie } from "./services/supabase.server";
import { getOptionalSessionUser } from "./session.server";

export const loadPosts = async (
  request: Request,
  urlParams: Params<string>
) => {
  const { user, session } = await getOptionalSessionUser(request);
  const params = new URL(request.url).searchParams;
  const { data: posts, error } = await getPosts({
    page:
      (urlParams?.page != null ? +urlParams.page : null) ??
      +(params.get("page") ?? 0),
    userId: urlParams?.userId ?? params.get("userId") ?? undefined,
  });
  if (error || !posts)
    throw new Response(
      error?.message || "Could not fetch posts",
      {
        status: 500,
        headers: session && {
          "Set-Cookie": await authCookie.commitSession(session),
        },
      }
    );
  for (let post of posts) {
    post.total_likes = (await getLikeCount({ postId: post.id })) ?? 0;
    post.liked =
      !!user &&
      ((await getHasUserLiked({ postId: post.id, userId: user.id })) ?? false);
  }
  return posts;
};

export type ProfileMetrics = {
  post_count: number;
  follower_count: number;
  following_count: number;
};

export const getUserMetrics = async (
  profileId: string
): Promise<ProfileMetrics> => {
  try {
    return {
      post_count: await getPostCountForUser(profileId),
      follower_count: await getFollowerCount(profileId),
      following_count: await getFollowingCount(profileId),
    };
  } catch (e) {
    throw new Response(e as string, { status: 500 });
  }
};
