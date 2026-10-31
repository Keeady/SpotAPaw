import { Session } from "@supabase/supabase-js";
import { createClient } from "./supabase/server";
import { connection } from "next/server";

export async function getCurrentUserId(): Promise<string | null> {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function getCurrentSession(): Promise<Session | null> {
  await connection();
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session ?? null;
}
