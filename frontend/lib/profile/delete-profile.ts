import { Profile, ProfileResponse } from "./profile";
import { createClient } from "../auth/supabase/client";

export async function deleteMyProfile(
): Promise<ProfileResponse<void>> {
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

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/profile`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    credentials: "include",
  });

  if (!response.ok) {
    return {
      error: "Failed to update profile",
      errorCode: "",
      data: undefined,
    };
  }

  return {
    error: undefined,
    errorCode: undefined,
    data: undefined,
  };
}
