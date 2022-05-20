import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { useCallback, useEffect, useState } from "react";
import CreatePost from "~/components/posts/CreatePost";
import PostListItemCard from "~/components/posts/PostListItemCard";
import { getHasUserLiked, getLikeCount } from "~/models/like.server";
import type { Post } from "~/models/post.server";
import { getPosts } from "~/models/post.server";
import { getOptionalSessionUser } from "~/session.server";
import {
  useOptionalProfile,
  useOptionalUser,
  useScrolledToBottom
} from "~/utils";

type ActionData = {
  posts: Post[];
};

export const action: ActionFunction = async ({ request }) => {
  const user = await getOptionalSessionUser(request);
  const formData = await request.formData();
  const posts = await getPosts({
    page: +(formData.get("page") ?? 0),
  });
  if (posts?.length) {
    for (let post of posts) {
      post.total_likes = (await getLikeCount({ postId: post.id })) ?? 0;
      post.liked =
        !!user &&
        ((await getHasUserLiked({ postId: post.id, userId: user.id })) ??
          false);
    }
  }
  return json({ posts });
};

export default function Posts() {
  const fetcher = useFetcher<ActionData>();
  const user = useOptionalUser();
  const profile = useOptionalProfile();

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
    if (
      fetcher.state === "submitting" &&
      fetcher.submission.action === "/like"
    ) {
      const formData = fetcher.submission.formData;
      setPosts((posts) =>
        posts.map((post) =>
          formData.get("postId") === post.id.toString()
            ? {
                ...post,
                liked: formData.get("liked") === "true",
                total_likes:
                  formData.get("liked") === "true" && !post.liked
                    ? post.total_likes + 1
                    : formData.get("liked") === "false" && post.liked
                    ? post.total_likes - 1
                    : post.total_likes,
              }
            : post
        )
      );
    }
    if (!(fetcher.type === "done" && fetcher.state === "idle" && fetcher.data))
      return;
    if (!fetcher.data.posts?.length) {
      setHasReachedEndOfPosts(true);
    }
    setPosts((posts) => [...posts, ...(fetcher.data.posts ?? [])]);
  }, [fetcher]);

  useScrolledToBottom(fetchPosts);

  return (
    <div className="p-4">
      <div>
        {hasUser ? (
          <fetcher.Form method="post" action="/create">
            <CreatePost userAvatarUrl={profile?.avatar_url ?? ""} />
          </fetcher.Form>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-4 py-4 md:gap-8 md:py-8">
        {posts.length
          ? posts.map((post) => (
              <PostListItemCard
                key={post.id}
                post={post}
                isAuthenticated={hasUser}
                fetcher={fetcher}
                isSelfPost={post.creator.id === user?.id}
              />
            ))
          : fetcher.state === "idle" && (
              <div>There are no posts at the moment.</div>
            )}
        <div
          className={`flex items-center justify-center transition duration-150 ease-in-out ${
            fetcher.state === "idle" ? "opacity-0" : "opacity-100"
          }`}
        >
          <p className="animate-pulse">...</p>
        </div>
      </div>
    </div>
  );
}
