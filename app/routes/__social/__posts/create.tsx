import type { ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { createPost } from "~/models/post.server";
import { getSessionUser } from "~/session.server";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const { user, error } = await getSessionUser(request);
  const postText = formData.get("postText")?.toString() ?? "";
  const action = formData.get("action");
  if (!user || error) {
    throw new Response(error, {
      status: 401,
    });
  }
  switch (action) {
    case "create":
      const { error } = await createPost({
        body: postText,
        userId: user.id,
      });
      if (error)
        throw new Response(error, {
          status: 500,
        });
      return redirect("/");
    default:
      throw new Response(
        `Posts action "${action}" does not match any recognized actions.`,
        {
          status: 404,
        }
      );
  }
};

export default function CreatePost() {
  return null;
}
