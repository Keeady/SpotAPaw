import { supabase } from "./supabase-client";

export function log(issue: string) {
  try {
    supabase
      .from("logs")
      .insert([{ issue }])
      .select()
  } catch {
    // error
  }
}
