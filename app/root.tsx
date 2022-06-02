import type {
  LinksFunction,
  LoaderFunction,
  MetaFunction
} from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration, useLoaderData
} from "@remix-run/react";
import { setUserPresence } from "./models/presence.server";
import { getProfile, updateProfile } from "./models/profile.server";
import { authCookie } from "./services/supabase.server";
import { getOptionalSessionUser } from "./session.server";
import globalStylesheetUrl from "./styles/global.css";
import tailwindStylesheetUrl from "./styles/tailwind.css";

export const meta: MetaFunction = () => {
  return { title: "Suja", description: "The social tourism platform" };
};

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: tailwindStylesheetUrl },
    { rel: "stylesheet", href: globalStylesheetUrl },
  ];
};

export const loader: LoaderFunction = async ({ request }) => {
  const { user, session } = await getOptionalSessionUser(request);
  let profile;
  if (user) {
    profile = (await getProfile(user.id))?.data;
    if (!profile?.name || !profile?.role || !profile?.avatar_url) {
      const { data, error, status } = await updateProfile(user.id, {
        avatar_url: user.user_metadata.avatar_url,
        name: user.user_metadata.full_name,
        role: "user",
      });
      if (error) {
        throw new Response(error.message, {
          status,
        });
      }
      profile = data;
    }
    await setUserPresence({
      last_seen: new Date(),
      forced_offline: false,
      profile_id: profile.id,
    });
  }
  return json(
    {
      user,
      profile,
      ENV: {
        SUPABASE_URL: process.env.SUPABASE_URL,
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
      },
    },
    {
      headers: session && {
        "Set-Cookie": await authCookie.commitSession(session),
      },
    }
  );
};

export default function App() {
  const data = useLoaderData();

  return (
    <html lang="en" className="h-full bg-stone-900">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="text-slate-300/80">
        <div className="h-full md:mx-auto md:max-w-7xl">
          <Outlet />
        </div>
        <ScrollRestoration />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(data?.ENV)}`,
          }}
        />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
