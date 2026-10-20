import { AggregatedSighting } from "./agregated-sighting";

type AggregatedSightingsProps = {
  latitude: number;
  longitude: number;
};

type AggregatedSightingsSuccessResponse = {
  data: AggregatedSighting[];
  error: undefined
};

type AggregatedSightingsErrorResponse = {
  error: string;
  data: []
};

export type AggregatedSightingsResponse =
  | AggregatedSightingsSuccessResponse
  | AggregatedSightingsErrorResponse;

export async function getAggregatedSightings({
  latitude,
  longitude,
}: AggregatedSightingsProps): Promise<AggregatedSightingsResponse> {
  const host = process.env.API_HOST;
  const port = process.env.API_PORT;
  if (!host || !port) {
    return {error: "Invalid endpoint api.", data: [] };
  }

  try {
    const res = await fetch(
      `${host}:${port}/aggregated-sightings?latitude=${latitude}&longitude=${longitude}`,
    );
    if (!res.ok) {
      console.log(res);
      return {data: [], error: "Failed to fetch aggregated sightings" };
    }
    const data = await res.json();

    return { data, error: undefined};
  } catch (error) {
    console.error(error);
    return {data: [], error: "Failed to fetch sightings." };
  }
}
