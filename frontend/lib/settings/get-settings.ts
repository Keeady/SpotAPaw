import { Settings, SettingsResponse } from "./settings";
import { createClient } from "../auth/supabase/client";

export async function getMySettings(): Promise<SettingsResponse<Settings>> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  let headers = {};
  if (session) {
    headers = {
      Authorization: `Bearer ${session.access_token}`,
    }
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/settings`, {
    headers,
  });

  if (!response.ok) {
    return {
      error: "Failed to fetch profile",
      errorCode: "",
      data: undefined,
    };
  }

  const settings = await response.json();
  return {
    error: undefined,
    errorCode: undefined,
    data: settings,
  };
}
