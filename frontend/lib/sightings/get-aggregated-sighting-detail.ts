import {
  AggregatedSightingDetail,
  AggregatedSightingsResponse,
} from "./agregated-sighting";

type AggregatedSightingByIdProps = {
  aggregatedSightingId: string;
  linkedSightingId: string;
};

export async function getAggregatedSightingById({
  aggregatedSightingId,
  linkedSightingId,
}: AggregatedSightingByIdProps): Promise<
  AggregatedSightingsResponse<AggregatedSightingDetail>
> {
  const host = process.env.NEXT_PUBLIC_API_HOST;
  if (!host) {
    return { error: "Invalid endpoint api.", data: undefined };
  }

  if (!aggregatedSightingId) {
    return { error: "Invalid parameter.", data: undefined };
  }

  const url = linkedSightingId
    ? `${host}/aggregated-sightings/${aggregatedSightingId}/details?linkedSightingId=${linkedSightingId}`
    : `${host}/aggregated-sightings/${aggregatedSightingId}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.log(await res.text());
      return {
        data: undefined,
        error: "Failed to fetch aggregated sighting detail",
      };
    }
    const data = await res.json();
    console.log(data);

    return { data, error: undefined };
  } catch (error) {
    console.error(error);
    return { data: undefined, error: "Failed to fetch sighting detail." };
  }
}
