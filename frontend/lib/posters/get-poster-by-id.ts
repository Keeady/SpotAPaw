import { Poster, PostersResponse } from "./poster";

export async function getPosterById(
  posterId: string | null,
  sightingId: string | null,
): Promise<PostersResponse<Poster>> {
  const host = process.env.NEXT_PUBLIC_API_HOST;
  const port = process.env.NEXT_PUBLIC_API_PORT;
  if (!host) {
    return { error: "Invalid endpoint api.", data: undefined };
  }

  const portPath = port ? `:${port}` : "";
  const path = `${host}${portPath}`;

  const query = new URLSearchParams();

  if (posterId) query.set("posterId", posterId);
  if (sightingId) query.set("sightingId", sightingId);

  try {
    const res = await fetch(`${path}/posters?${query.toString()}`);
    if (!res.ok) {
      console.log(res)
      return { data: undefined, error: "Failed to fetch posters" };
    }
    const data = await res.json();
    console.log(data);

    return { data, error: undefined };
  } catch (error) {
    console.error(error);
    return { data: undefined, error: "Failed to fetch sightings." };
  }
}
