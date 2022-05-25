import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useFetcher } from "@remix-run/react";
import { useCallback } from "react";
import Avatar from "~/components/ui-kit/Avatar";
import SearchInput from "~/components/ui-kit/SearchInput";
import { searchMutualFollowers } from "~/models/follower.server";
import type { Profile } from "~/models/profile.server";
import { authCookie } from "~/services/supabase.server";
import { getSessionUser } from "~/session.server";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const { user, session, error } = await getSessionUser(request);
  if (!user || error)
    throw new Response(error ?? "You are unauthorized", { status: 401 });
  const query = formData.get("query") as string;
  if (!query)
    return {
      searchResults: [],
    };
  const searchResults = (await searchMutualFollowers(user.id, query)) ?? [];
  return json(
    {
      searchResults,
    },
    {
      headers: session && {
        "Set-Cookie": await authCookie.commitSession(session),
      },
    }
  );
};

export default function Chats() {
  const fetcher = useFetcher();
  const searchMutuals = useCallback(
    (value: string) => {
      const formData = new FormData();
      formData.append("query", value);
      fetcher.submit(formData, {
        method: "post",
      });
    },
    [fetcher]
  );
  return (
    <div className="flex flex-col gap-y-4 p-4">
      <p>Select a conversation from the left or start a new chat:</p>
      <SearchInput
        placeholder="Search your mutual followers"
        onChange={searchMutuals}
      />
      {fetcher.data?.searchResults?.map(
        ({ follower }: { follower: Profile }) => (
          <Link to={`/chat/${follower.id}`} key={follower.id}>
            <div className="flex items-center gap-x-4">
              <Avatar src={follower.avatar_url} alt="Follower" size={42} />
              <p>{follower.name}</p>
            </div>
          </Link>
        )
      )}
      <p></p>
    </div>
  );
}
