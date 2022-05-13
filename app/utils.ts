import { useMemo } from "react";
import { useMatches } from "@remix-run/react";
import type { Provider, User } from "@supabase/supabase-js";
import { supabaseClient } from "~/services/supabase.client";

export function useMatchesData(id: string) {
  const matchingRoutes = useMatches();
  const route = useMemo(
    () => matchingRoutes.find((route) => route.id === id),
    [matchingRoutes, id]
  );

  return route?.data;
}

export function useOptionalUser(): User | null {
  const data = useMatchesData("root");
  return data?.user ?? null;
}

export function useUser() {
  const maybeUser = useOptionalUser();
  if (!maybeUser) {
    throw new Error(
      "No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead."
    );
  }
  return maybeUser;
}

export function validateEmail(email: unknown): email is string {
  return typeof email === "string" && email.length > 3 && email.includes("@");
}

export async function signInWithProvider(
  provider: Provider,
  redirectTo: string
) {
  const redirectUrl = `${window.location.origin}/api/auth/callback?redirectTo=${redirectTo}`;
  return await supabaseClient.auth.signIn(
    {
      provider,
    },
    {
      redirectTo: redirectUrl,
    }
  );
}
