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
  const port = process.env.NEXT_PUBLIC_API_PORT;
  if (!host) {
    return { error: "Invalid endpoint api.", data: undefined };
  }

  if (!aggregatedSightingId) {
    return { error: "Invalid parameter.", data: undefined };
  }

  const portPath = port ? `:${port}` : "";
  const path = `${host}${portPath}`;

  try {
    const res = await fetch(
      `${path}/aggregated-sightings/${aggregatedSightingId}?linked_sighting_id=${linkedSightingId}`,
    );
    if (!res.ok) {
      console.log(res);
      return {
        data: undefined,
        error: "Failed to fetch aggregated sighting detail",
      };
    }
    const data = await res.json();

    return { data, error: undefined };
  } catch (error) {
    console.error(error);
    return { data: undefined, error: "Failed to fetch sighting detail." };
  }
}
