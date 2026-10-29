import { connection } from "next/server";
import { createClient } from "../auth/supabase/server";
import { Profile, ProfileResponse } from "./profile";

export async function getMyProfile(): Promise<ProfileResponse<Profile>> {
  await connection();
  const supabase = await createClient();
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
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    return {
      error: "Failed to fetch profile",
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
