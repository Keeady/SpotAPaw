import {
  AggregatedSighting,
  AggregatedSightingsResponse,
} from "./agregated-sighting";

type AggregatedSightingsProps = {
  latitude: number;
  longitude: number;
};

export async function getAggregatedSightings({
  latitude,
  longitude,
}: AggregatedSightingsProps): Promise<
  AggregatedSightingsResponse<AggregatedSighting[]>
> {
  const host = process.env.NEXT_PUBLIC_API_HOST;
  const port = process.env.NEXT_PUBLIC_API_PORT;
  if (!host) {
    return { error: "Invalid endpoint api.", data: undefined };
  }

  const portPath = port ? `:${port}` : "";
  const path = `${host}${portPath}`;
  try {
    const res = await fetch(
      `${path}/aggregated-sightings?latitude=${latitude}&longitude=${longitude}`,
    );
    if (!res.ok) {
      return { data: undefined, error: "Failed to fetch aggregated sightings" };
    }
    const data = await res.json();

    return { data, error: undefined };
  } catch (error) {
    console.error(error);
    return { data: undefined, error: "Failed to fetch sightings." };
  }
}
