import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { unfollowUser } from "~/models/follower.server";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  await unfollowUser(
    formData.get("followingId") as string,
    formData.get("followerId") as string
  );

  return json({
    done: true,
  });
};
