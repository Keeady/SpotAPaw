type AggregatedSightingsProps = {
  latitude: number;
  longitude: number;
}
export async function getAggregatedSightings({latitude, longitude} : AggregatedSightingsProps) {
  const host = process.env.API_HOST;
  const port = process.env.API_PORT;
  if (!host || !port) {
    return;
  }

  try {
    const res = await fetch(`${host}:${port}/aggregated-sightings?lat=${latitude}&lng=${longitude}`);
    if (!res.ok) {
      throw new Error("Failed to fetch bio");
    }
    return res.json();

  } catch (error) {
    console.error(error);
    return [];
  }
}
