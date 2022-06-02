import { useMatches } from "@remix-run/react";
import type { Provider, User } from "@supabase/supabase-js";
import type { RefObject } from "react";
import { useEffect, useMemo } from "react";
import { supabaseClient } from "~/services/supabase.client";
import type { PresenceResponse } from "./models/presence.server";
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

export function useUser(): User {
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

const relativeTimeFormat = new Intl.RelativeTimeFormat("en", {
  style: "short",
});

export function getAgoDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const diffSeconds = Math.floor(diff / 1000);
  const diffMinutes = Math.floor(diff / (1000 * 60));
  const diffHours = Math.floor(diff / (1000 * 60 * 60));
  const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diff / (1000 * 60 * 60 * 24 * 7));
  const diffMonths = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
  const diffYears = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
  let period: Intl.RelativeTimeFormatUnit;
  let value: number;
  if (diffSeconds < 60) {
    value = diffSeconds;
    period = "second";
  } else if (diffMinutes < 60) {
    value = diffMinutes;
    period = `minute`;
  } else if (diffHours < 24) {
    value = diffHours;
    period = `hour`;
  } else if (diffDays < 7) {
    value = diffDays;
    period = `day`;
  } else if (diffWeeks < 4) {
    value = diffWeeks;
    period = `week`;
  } else if (diffMonths < 12) {
    value = diffMonths;
    period = `month`;
  } else {
    value = diffYears;
    period = `year`;
  }

  return relativeTimeFormat.format(-value, period);
}

export const getPresenceWithStatus = (
  presence: PresenceResponse
): PresenceResponse => {
  const limitTime = new Date(Date.now() - 2 * 60 * 1000);
  const isOnline =
    !presence?.forced_offline &&
    presence?.last_seen &&
    new Date(presence?.last_seen).getTime() > limitTime.getTime();

  return {
    ...presence,
    status: isOnline ? "online" : "offline",
  };
};
