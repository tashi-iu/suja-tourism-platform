import { createCookieSessionStorage } from "@remix-run/node";
import type { SupabaseClientOptions } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";

import { name as appName } from "../../package.json";

if (!process.env.SUPABASE_URL) {
  throw new Error("SUPABASE_URL is required");
}

if (!process.env.SUPABASE_SECRET_KEY) {
  throw new Error("SUPABASE_SECRET_KEY is required");
}

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET is required");
}

const supabaseOptions: SupabaseClientOptions = {
  schema: "public",
  persistSession: true,
  autoRefreshToken: true,
  detectSessionInUrl: true,
  headers: { "x-application-name": appName },
};

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseKey,
  supabaseOptions
);

export type SupabaseError = { error?: string };

export const authCookie = createCookieSessionStorage({
  cookie: {
    name: "sb:token",
    expires: new Date(Date.now() + 3600),
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});
