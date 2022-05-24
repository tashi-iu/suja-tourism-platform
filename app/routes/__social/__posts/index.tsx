import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import CreatePost from "~/components/posts/CreatePost";
import PostList from "~/components/posts/PostList";
import type { Post } from "~/models/post.server";
import { useOptionalProfile, useOptionalUser } from "~/utils";
import { loadPosts } from "~/utils.server";

export type PostsLoaderData = {
  posts: Post[];
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const posts = await loadPosts(request, params);
  return json({
    posts,
  });
};

export default function Posts() {
  const user = useOptionalUser();
  const profile = useOptionalProfile();

  const hasUser = user?.aud === "authenticated";

  return (
    <div className="p-4">
      <div>
        <CreatePost currentUser={profile} />
      </div>

      <PostList
        isAuthenticated={hasUser}
        currentUser={user}
      />
    </div>
  );
}
