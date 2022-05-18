import type { ActionFunction } from "@remix-run/node";
import { redirect, Response } from "@remix-run/node";
import { authCookie } from "~/services/supabase.server";
import { signOutUser } from "~/session.server";

export const action: ActionFunction = async ({ request }) => {
  let session = await authCookie.getSession(request.headers.get("Cookie"));

  const { done, error } = await signOutUser(session);

  if (!done || error) {
    throw new Response(error || "Failed to Sign Out. Please try again.");
  }

  return redirect("/", {
    status: 200,
    headers: {
      "Set-Cookie": await authCookie.destroySession(session),
    },
  });
};
