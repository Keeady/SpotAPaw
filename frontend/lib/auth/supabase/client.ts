import { createBrowserClient } from "@supabase/ssr";
import { loadEnvConfig } from '@next/env'

export function createClient() {
    loadEnvConfig(process.cwd());
    console.log(process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!)

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
  );
}
