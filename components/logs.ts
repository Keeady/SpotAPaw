import { PostgrestError } from "@supabase/supabase-js";
import { supabase } from "./supabase-client";

export function log(issue: string) {
  try {
    supabase
      .from("logs")
      .insert([{ issue }])
      .select()
      .then((r) => {
        console.log(r);
      });
  } catch (e) {
    console.log(e);
  }
}
