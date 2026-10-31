import { Session } from "@supabase/supabase-js";
import { Sighting, SightingsResponse } from "./sighting";
import { getCurrentSession } from "../auth/action";

export async function getMySightings(): Promise<SightingsResponse<Sighting[]>> {
  const session = await getCurrentSession();
  if (!session) {
    return {
      data: undefined,
      error: "",
      errorCode: "NOT_AUTHENTICATED",
    };
  }

  const host = process.env.NEXT_PUBLIC_API_HOST;
  if (!host) {
    return { error: "Invalid endpoint api.", data: undefined, errorCode: "" };
  }

  try {
    const res = await fetch(`${host}/sightings/my`, {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });
    if (!res.ok) {
      return {
        data: undefined,
        error: "Failed to fetch sightings",
        errorCode: "",
      };
    }
    const data = await res.json();

    return { data, error: undefined, errorCode: undefined };
  } catch (error) {
    console.error(error);
    return {
      data: undefined,
      error: "Failed to fetch sightings.",
      errorCode: "",
    };
  }
}
