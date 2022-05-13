import type { SupabaseError } from "~/services/supabase.server";
import { supabaseAdmin } from "~/services/supabase.server";

import type { User } from "@supabase/supabase-js";
import type { Session } from "@remix-run/node";

import { authCookie } from "~/services/supabase.server";

import { redirect } from "@remix-run/node";

export async function setSBAuth(session: Session): Promise<void> {
  const userAccessToken = session.get("access_token");
  supabaseAdmin.auth.setAuth(userAccessToken);
}

export function setAuthSession(
  session: Session,
  accessToken: string,
  refreshToken: string
): Session {
  session.set("access_token", accessToken);
  session.set("refresh_token", refreshToken);

  return session;
}

function hasAuthSession(session: Session): boolean {
  try {
    return session.has("access_token");
  } catch {
    return false;
  }
}

export async function hasActiveAuthSession(session: Session): Promise<boolean> {
  try {
    if (!hasAuthSession(session)) return false;

    const { user, error } = await getUserByAccessToken(
      session.get("access_token")
    );

    if (error || !user) return false;
    return true;
  } catch {
    return false;
  }
}

export async function refreshUserToken(session: Session): Promise<LoginReturn> {
  try {
    const { data, error } = await supabaseAdmin.auth.api.refreshAccessToken(
      session.get("refresh_token")
    );

    if (error || !data || !data.access_token || !data.refresh_token) {
      return { error: error?.message || "Something went wrong" };
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
    };
  } catch {
    return { error: "Something went wrong" };
  }
}

type LoginReturn = {
  accessToken?: string;
  refreshToken?: string;
} & SupabaseError;

type SignOutUserReturn = {
  done: boolean;
} & SupabaseError;
export async function signOutUser(
  session: Session
): Promise<SignOutUserReturn> {
  try {
    const { error } = await supabaseAdmin.auth.api.signOut(
      session.get("access_token")
    );
    if (error) {
      return { done: false, error: error?.message || "Something went wrong" };
    }
    return { done: true };
  } catch {
    return {
      done: false,
      error: "Something went wrong",
    };
  }
}

type GetUserReturn = {
  user?: User;
} & SupabaseError;
export async function getUserByAccessToken(
  accessToken: string
): Promise<GetUserReturn> {
  try {
    const { user, error } = await supabaseAdmin.auth.api.getUser(accessToken);

    if (error || !user) {
      return { error: error?.message || "Something went wrong" };
    }

    return { user };
  } catch {
    return {
      error: "Something went wrong",
    };
  }
}

export async function getOptionalUser(request: Request): Promise<User | null> {
  try {
    let session = await authCookie.getSession(request.headers.get("Cookie"));

    const isActiveAuthSession = await hasActiveAuthSession(session);
    if (!isActiveAuthSession) {
      const { accessToken, refreshToken, error } = await refreshUserToken(
        session
      );
      if (error || !accessToken || !refreshToken) {
        return null;
      }
      session = setAuthSession(session, accessToken, refreshToken);
    }

    const { user, error: accessTokenError } = await getUserByAccessToken(
      session.get("access_token")
    );

    if (accessTokenError || !user || !user.email || !user.id) {
      return null;
    }

    return user;
  } catch (error) {
    return null;
  }
}

export async function authenticated(
  request: Request,
  successFunction: (user: User) => Response | Promise<Response>,
  failureFunction: () => Response | Promise<Response>,
  redirectTo?: string
): Promise<Response> {
  try {
    let session = await authCookie.getSession(request.headers.get("Cookie"));
    const url = new URL(request.url);
    const redirectUrl =
      redirectTo || `${url.origin}${url.pathname}${url.search}`;

    const isActiveAuthSession = await hasActiveAuthSession(session);
    if (!isActiveAuthSession) {
      const { accessToken, refreshToken, error } = await refreshUserToken(
        session
      );
      if (error || !accessToken || !refreshToken) {
        throw new Error("refreshUserToken " + error);
      }
      session = setAuthSession(session, accessToken, refreshToken);
      return redirect(redirectUrl, {
        headers: {
          "Set-Cookie": await authCookie.commitSession(session),
        },
      });
    }

    const { user, error: accessTokenError } = await getUserByAccessToken(
      session.get("access_token")
    );

    if (accessTokenError || !user || !user.email || !user.id) {
      throw new Error("getUserByAccessToken " + accessTokenError);
    }

    return await successFunction(user);
  } catch (error) {
    console.error(error);
    return failureFunction();
  }
}