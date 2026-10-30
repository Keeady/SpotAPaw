import {
  Poster,
  PosterEditableFields,
  PostersResponse,
  PosterUpdate,
} from "./poster";

export type PosterChanges = Partial<Record<keyof PosterEditableFields, string>>;

export async function updatePoster(
  id: string,
  changes: PosterChanges,
): Promise<PostersResponse<PosterUpdate>> {
  const host = process.env.NEXT_PUBLIC_API_HOST;
  if (!host) {
    return { error: "Invalid endpoint api.", data: undefined };
  }

  try {
    const res = await fetch(`${host}/posters/${id}`, {
      method: "PATCH",
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: "include",
      body: JSON.stringify(changes),
    });
    if (!res.ok) {
      return { data: undefined, error: "Failed to update poster" };
    }
    const data = await res.json();

    return { data, error: undefined };
  } catch (error) {
    console.error(error);
    return { data: undefined, error: "Failed to fetch sightings." };
  }
}
