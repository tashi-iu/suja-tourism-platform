import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { NavLink, useFetcher, useLoaderData } from "@remix-run/react";
import { ImLocation } from "react-icons/im";
import PostList from "~/components/posts/PostList";
import Avatar from "~/components/ui-kit/Avatar";
import { checkUserFollowing } from "~/models/follower.server";
import type { Profile } from "~/models/profile.server";
import { getProfile } from "~/models/profile.server";
import { authCookie } from "~/services/supabase.server";
import { getOptionalSessionUser } from "~/session.server";
import { useOptionalUser } from "~/utils";
import type { ProfileMetrics } from "~/utils.server";
import { getUserMetrics, loadPosts } from "~/utils.server";

type LoaderData = {
  user: Profile;
  userMetrics: ProfileMetrics;
  isUserFollowing: boolean;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = params.userId as string;
  const { data: user, error } = await getProfile(userId);
  if (error || !user)
    throw new Response(error?.message || "User not found.", { status: 500 });

  const userMetrics = await getUserMetrics(userId);

  const { user: sessionUser, session } = await getOptionalSessionUser(request);

  const isUserFollowing =
    sessionUser && (await checkUserFollowing(sessionUser.id, userId));

  const posts = await loadPosts(request, params);

  return json(
    {
      user,
      posts,
      userMetrics,
      isUserFollowing,
    },
    {
      headers: session && {
        "Set-Cookie": await authCookie.commitSession(session),
      },
    }
  );
};

export default function User() {
  const { user, userMetrics, isUserFollowing } = useLoaderData<LoaderData>();
  const currentUser = useOptionalUser();
  const fetcher = useFetcher();

  const hasUser = currentUser?.aud === "authenticated";
  const isSelfProfile = currentUser?.id === user.id;
  const isSelfProfileComplete = hasUser && isSelfProfile ? user.location : true;

  return (
    <div className="p-4">
      <div className="flex w-full items-center gap-4 pb-4">
        <div className="">
          <Avatar src={user.avatar_url} alt="Profile" size={64} />
        </div>
        <div>
          <p className="text-ellipsis text-xl font-semibold text-slate-400/80">
            {user.name}
          </p>
          <p className="flex items-center gap-x-1 text-ellipsis text-slate-400/60">
            <ImLocation />
            {user.location ?? "Unknown"}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-evenly gap-x-2 pb-4">
        {[
          {
            label: "Posts",
            value: userMetrics.post_count,
          },
          {
            label: "Following",
            value: userMetrics.following_count,
          },
          {
            label: "Followers",
            value: userMetrics.follower_count,
          },
        ].map((metric) => (
          <div
            key={metric.label}
            className="flex flex-col items-center justify-center"
          >
            <p className="text-slate-300/40">{metric.label}</p>
            <p>{metric.value}</p>
          </div>
        ))}
      </div>
      {hasUser && !isSelfProfile ? (
        <div className="py-4">
          <fetcher.Form
            method="post"
            action={isUserFollowing ? "/u/unfollow" : "/u/follow"}
          >
            <input type="hidden" name="followerId" value={currentUser.id} />
            <input type="hidden" name="followingId" value={user.id} />
            <button
              type="submit"
              className={`w-full rounded-md p-2 ${
                isUserFollowing
                  ? "border border-slate-500/80"
                  : "bg-slate-500/80"
              }`}
            >
              {isUserFollowing ? "Followed" : "Follow"}
            </button>
          </fetcher.Form>
        </div>
      ) : null}
      {!isSelfProfileComplete ? (
        <div className="flex items-center justify-between rounded-md border-2 border-slate-400/50 bg-slate-500/30 p-2">
          <p>You haven't completed your profile yet.</p>
          <NavLink to="/settings/profile">
            <button className="rounded-md bg-slate-600 py-1 px-2">
              Complete Profile
            </button>
          </NavLink>
        </div>
      ) : null}
      <PostList
        currentUser={currentUser}
        isAuthenticated={hasUser}
        postParams={{
          userId: user?.id,
        }}
      />
    </div>
  );
}
