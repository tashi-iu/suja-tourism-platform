import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { followUser } from "~/models/follower.server";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  await followUser(
    formData.get("followingId") as string,
    formData.get("followerId") as string
  );

  return json({
    done: true,
  });
};
