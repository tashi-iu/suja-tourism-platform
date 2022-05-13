import { useEffect } from "react";

import type { ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { supabaseClient } from "~/services/supabase.client";
import { authCookie } from "~/services/supabase.server";

import type { Session } from "@supabase/supabase-js";
import { setAuthSession } from "~/session.server";
import { useFetcher, useSearchParams } from "@remix-run/react";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const formDataSession = formData.get("session") as string | null;
  const redirectTo = String(formData.get("redirectTo")) || "/";
  if (!formDataSession) {
    return redirect("/");
  }
  const SupabaseSession: Session = JSON.parse(formDataSession);

  let session = await authCookie.getSession(request.headers.get("Cookie"));
  const { access_token: accessToken, refresh_token: refreshToken } =
    SupabaseSession;

  session = setAuthSession(session, accessToken, refreshToken || "");

  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await authCookie.commitSession(session),
    },
  });
};

export default function AuthCallback() {
  const fetcher = useFetcher();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (fetcher.state !== "idle" || fetcher.type !== "init") return;
    setTimeout(() => {
      const formData = new FormData();
      formData.append("session", JSON.stringify(supabaseClient.auth.session()));
      formData.append("redirectTo", searchParams.get("redirectTo") || "/");

      fetcher.submit(formData, { method: "post" });
    }, 2000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher]);

  return (
    <div className="flex animate-pulse items-center justify-center">
      Please hang on while we sign you in...
    </div>
  );
}
