import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { useCallback, useEffect, useState } from "react";
import CreatePost from "~/components/posts/CreatePost";
import PostListItemCard from "~/components/posts/PostListItemCard";
import type { Post } from "~/models/post.server";
import { getPosts } from "~/models/post.server";
import { useOptionalUser, useScrolledToBottom } from "~/utils";

type ActionData = {
  posts: Post[];
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const posts = await getPosts({
    page: +(formData.get("page") ?? 0),
  });
  return json({ posts });
};

export default function Posts() {
  const fetcher = useFetcher<ActionData>();
  const user = useOptionalUser();

  const hasUser = user?.aud === "authenticated";

  const [page, setPage] = useState(0);
  const [posts, setPosts] = useState<Post[]>([]);
  const [hasReachedEndOfPosts, setHasReachedEndOfPosts] = useState(false);

  const fetchPosts = useCallback(() => {
    if (fetcher.state !== "idle" || hasReachedEndOfPosts) return;
    const pageQuery = new FormData();
    pageQuery.append("page", page.toString());
    fetcher.submit(pageQuery, {
      method: "post",
    });
    setPage((page) => page + 1);
  }, [fetcher, hasReachedEndOfPosts, page]);

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!(fetcher.type === "done" && fetcher.state === "idle" && fetcher.data))
      return;

    if (!fetcher.data.posts || fetcher.data.posts?.length === 0) {
      setHasReachedEndOfPosts(true);
    }
    setPosts((posts) => [...posts, ...fetcher.data.posts]);
  }, [fetcher]);

  useScrolledToBottom(fetchPosts);

  return (
    <div className="p-4">
      <div>
        {hasUser ? (
          <fetcher.Form method="post" action="/create">
            <CreatePost userAvatarUrl={user?.user_metadata.avatar_url} />
          </fetcher.Form>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-4 py-2 md:gap-8 md:py-8">
        {posts ? (
          posts.length ? (
            posts.map((post) => (
              <PostListItemCard
                key={post.id}
                post={post}
                isAuthenticated={hasUser}
                isSelfPost={post.creator.id === user?.id}
              />
            ))
          ) : (
            <div>There are no posts at the moment.</div>
          )
        ) : null}
        <div
          className={`flex items-center justify-center transition duration-150 ease-in-out ${
            fetcher.state === "idle" ? "opacity-0" : "opacity-100"
          }`}
        >
          <p className="animate-pulse">Loading...</p>
        </div>
      </div>
    </div>
  );
}
