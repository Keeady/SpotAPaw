import { getCurrentSession } from "../auth/action";
import { Pet, PetsResponse } from "./pet";

export async function getMyPets(): Promise<PetsResponse<Pet[]>> {
  const session = await getCurrentSession();

  if (!session) {
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
