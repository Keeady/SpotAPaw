import { connection } from "next/server";
import { createClient } from "../auth/supabase/server";
import { Pet, PetsResponse } from "./pet";

export async function getMyPets(): Promise<PetsResponse<Pet[]>> {
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

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/pets/my`, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    return {
      error: "Failed to fetch pets",
      errorCode: "",
      data: undefined,
    };
  }

  const pets = await response.json();
  return {
    error: undefined,
    errorCode: undefined,
    data: pets,
  };
}
