import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { updatePostLiked } from "~/models/like.server";
import { getOptionalSessionUser } from "~/session.server";

export const action: ActionFunction = async ({ request }) => {
  const user = await getOptionalSessionUser(request);
  if (!user) throw new Response("Unauthorized", { status: 401 });
  const formData = await request.formData();
  const liked = formData.get("liked") === "true";
  const postId = formData.get("postId") as string;
  try {
    await updatePostLiked({
      liked,
      postId,
      userId: user.id,
    });
    return json({
      done: true,
    });
  } catch (e) {
    return new Response(
      typeof e === "string"
        ? e
        : "An unknown error occured while liking the post",
      {
        status: 500,
      }
    );
  }
};
