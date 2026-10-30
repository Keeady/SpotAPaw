import { Profile, ProfileResponse } from "./profile";
import { createClient } from "../auth/supabase/client";

export async function updateMyProfile(
  changes: Profile,
): Promise<ProfileResponse<Profile>> {
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
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    credentials: "include",
    body: JSON.stringify({
      firstname: changes.firstname,
      lastname: changes.lastname,
      email: changes.email,
      countryCode: changes.countryCode,
      phone: changes.phone
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
