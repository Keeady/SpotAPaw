import { createClient } from "../auth/supabase/client";
import { Settings, SettingsResponse } from "./settings";

export async function updateSettings(
  changes: Settings,
): Promise<SettingsResponse<Settings>> {
  const supabase = createClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session) {
    return {
      error: "Not authenticated",
      errorCode: "NOT_AUTHENTICATED",
      data: undefined,
    };
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/settings`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    credentials: "include",
    body: JSON.stringify({
      isLocationEnabled: changes.isLocationEnabled,
      savedLongitude: changes.savedLongitude,
      savedLatitude: changes.savedLatitude,
      isAIenabled: changes.isAIenabled,
      language: changes.language,
      radius: changes.radius,
      isNotificationEnabled: changes.isNotificationEnabled,
    }),
  });

  if (!response.ok) {
    return {
      error: "Failed to update profile",
      errorCode: "",
      data: undefined,
    };
  }

  const profile = await response.json();
  return {
    error: undefined,
    errorCode: undefined,
    data: profile,
  };
}
