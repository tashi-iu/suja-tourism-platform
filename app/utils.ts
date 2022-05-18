import { useMatches } from "@remix-run/react";
import type { Provider, User } from "@supabase/supabase-js";
import type { RefObject } from "react";
import { useEffect, useMemo } from "react";
import { supabaseClient } from "~/services/supabase.client";
import type { Profile } from "./models/profile.server";

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

export function useUser(): User | null {
  const maybeUser = useOptionalUser();
  if (!maybeUser) {
    throw new Error(
      "No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead."
    );
  }
  return maybeUser;
}

export function useOptionalProfile(): Profile | null {
  const data = useMatchesData("root");
  return data?.profile ?? null;
}

export function useProfile(): Profile {
  const profile = useOptionalProfile();
  if (!profile) {
    throw new Error(
      "No profile found in root loader, but profile is required."
    );
  }
  return profile;
}

export function useScrolledToBottom<T extends HTMLElement>(
  onScroll: VoidFunction,
  elementRef?: RefObject<T>
) {
  useEffect(() => {
    const checkScrolledToBottom = (event: Event) => {
      const documentTarget = event.target as Document;
      const isAtBottom =
        (documentTarget.scrollingElement?.scrollHeight ?? 0) -
          Math.ceil(documentTarget.scrollingElement?.scrollTop ?? 0) ===
        documentTarget.scrollingElement?.clientHeight;
      if (isAtBottom) {
        onScroll();
      }
    };
    let timeout: number;

    const onScrollCallback = (event: Event) => {
      if (timeout) cancelAnimationFrame(timeout);
      timeout = requestAnimationFrame(() => checkScrolledToBottom(event));
    };

    (elementRef?.current ?? window).addEventListener(
      "scroll",
      onScrollCallback
    );

    return () => window.removeEventListener("scroll", onScrollCallback);
  }, [onScroll, elementRef]);
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
