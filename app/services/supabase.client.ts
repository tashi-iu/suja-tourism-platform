import type {
  SupabaseClient,
  SupabaseClientOptions,
} from "@supabase/supabase-js";
import { name } from "package.json";
import { createClient } from "@supabase/supabase-js";

const supabaseOptions: SupabaseClientOptions = {
  schema: "public",
  headers: { "x-application-name": name },
  persistSession: true,
  autoRefreshToken: true,
  detectSessionInUrl: true,
};

const customWindow = window as typeof window & { ENV: Record<string, string> };
const supabaseUrl = customWindow.ENV.SUPABASE_URL;
const supabaseKey = customWindow.ENV.SUPABASE_ANON_KEY;

export const supabaseClient: SupabaseClient = createClient(
  supabaseUrl,
  supabaseKey,
  supabaseOptions
);
