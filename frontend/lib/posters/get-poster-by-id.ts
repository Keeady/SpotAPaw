import { Poster, PostersResponse } from "./poster";

export async function getPosterById(
  posterId: string | null,
  sightingId: string | null,
): Promise<PostersResponse<Poster>> {
  const host = process.env.NEXT_PUBLIC_API_HOST;
  if (!host) {
    return { error: "Invalid endpoint api.", data: undefined };
  }

  const query = new URLSearchParams();

  if (posterId) query.set("posterId", posterId);
  if (sightingId) query.set("sightingId", sightingId);

  try {
    const res = await fetch(`${host}/posters?${query.toString()}`);
    if (!res.ok) {
      return { data: undefined, error: "Failed to fetch posters" };
    }
    const data = await res.json();

    return { data, error: undefined };
  } catch (error) {
    console.error(error);
    return { data: undefined, error: "Failed to fetch sightings." };
  }
}
