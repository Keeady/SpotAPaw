import { Match, MatchesResponse } from "./sighting-match";

// Assumed endpoint: adjust the path to match your NestJS controller.
export async function getMatches(
  sightingId: string,
): Promise<MatchesResponse<Match[]>> {
  const host = process.env.NEXT_PUBLIC_API_HOST;
  const port = process.env.NEXT_PUBLIC_API_PORT;
  if (!host) {
    return { error: "Invalid endpoint api.", data: undefined };
  }

  const portPath = port ? `:${port}` : "";
  const path = `${host}${portPath}`;
  try {
    const res = await fetch(`${path}/sighting-matches/?sightingId=${sightingId}`);

    if (!res.ok) {
      return { data: undefined, error: "Failed to fetch matched sightings" };
    }
    const data = await res.json();

    return { data, error: undefined };
  } catch (error) {
    console.error(error);
    return { data: undefined, error: "Failed to fetch matches." };
  }
}
