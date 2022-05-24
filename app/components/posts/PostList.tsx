import { useFetcher, useLoaderData } from "@remix-run/react";
import type { User } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";
import type { Post } from "~/models/post.server";
import { useScrolledToBottom } from "~/utils";
import PostListItemCard from "./PostListItemCard";

type PostListProps = {
  isAuthenticated: boolean;
  currentUser: User | null;
  postParams?: {
    userId?: string;
  };
};

export default function PostList({
  isAuthenticated,
  currentUser,
  postParams,
}: PostListProps) {
  const { posts: initialPosts } = useLoaderData();
  const fetcher = useFetcher();
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState<Post[]>(initialPosts ?? []);
  const [hasReachedEndOfPosts, setHasReachedEndOfPosts] = useState(false);

  const fetchPosts = useCallback(() => {
    if (
      (fetcher.type === "loaderSubmission" && fetcher.state === "submitting") ||
      hasReachedEndOfPosts
    )
      return;
    fetcher.load(
      `/?index&page=${page}${
        postParams?.userId ? `&userId=${postParams.userId}` : ""
      }`
    );
    setPage((page) => page + 1);
  }, [fetcher, hasReachedEndOfPosts, page, postParams?.userId]);

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
    <div className="flex flex-1 flex-col gap-4 py-4 md:gap-8 md:py-8">
      {posts.length
        ? posts.map((post) => (
            <PostListItemCard
              key={post.id}
              post={post}
              isAuthenticated={isAuthenticated}
              fetcher={fetcher}
              isSelfPost={post.creator.id === currentUser?.id}
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
  );
}
