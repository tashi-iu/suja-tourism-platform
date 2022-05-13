import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { Post } from "~/models/post.server";
import { getPostListItems } from "~/models/post.server";

type LoaderData = {
  posts: Post[];
};

export const loader: LoaderFunction = async ({ request }) => {
  const posts = await getPostListItems();
  return json({ posts });
};

export default function Posts() {
  const { posts } = useLoaderData<LoaderData>();
  return (
    <div className="grid flex-1 grid-flow-col grid-rows-1 p-4 md:grid-rows-3">
      {posts?.length ? (
        posts.map((post) => (
          <div
            key={`post-${post.id}`}
            className={`rounded bg-[url('${post.image_url}')]`}
          >
            <p>{post.title}</p>
          </div>
        ))
      ) : (
        <div>There are no posts at the moment.</div>
      )}
    </div>
  );
}
