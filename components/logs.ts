import { supabase } from "./supabase-client";

export function log(issue: string) {
  try {
    supabase
      .from("logs")
      .insert([{ issue }])
      .then(({ error }) => {
        if (error) {
          console.log(error);
        }
      });
  } catch (error) {
    console.log(error);
  }
}
