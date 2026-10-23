import { getAggregatedSightings } from "@/lib/sightings/get-aggregated-sightings";
import SightingCard from "./sighting-card";
import { AggregatedSighting } from "@/lib/sightings/agregated-sighting";
import { SightingLocationManager } from "@/app/components/location/manager";
import { getSavedSearchLocation, saveSearchLocation } from "./action";
import EmptySighting from "@/app/components/sightings/empty-sightings";

export default async function SightingList() {
  const location = await getSavedSearchLocation();
  if (!location) {
    return <SightingLocationManager onLocationSelected={saveSearchLocation} />;
  }

  const { data, error } = await getAggregatedSightings({
    latitude: location.latitude,
    longitude: location.longitude,
  });

  if (!data || data.length === 0) {
    return <EmptySighting error={error} />;
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <ul>
        {data.map((s: AggregatedSighting) => (
          <li key={s.id} className="pt-4">
            <SightingCard
              sighting={s}
              currentLocation={location}
              href={`/aggregated-sightings/${s.id}?linkedSightingId=${s.linkedSightingId}`}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
