import { getAggregatedSightings } from "@/lib/sightings/get-aggregated-sightings";
import SightingCard from "./sighting-card";
import { AggregatedSighting } from "@/lib/sightings/agregated-sighting";
import { SightingLocationManager } from "@/app/components/location/manager";
import { getSavedLocation, SIGHTING_LOCATION_KEY } from "@/app/components/location/location-utils";
import { useCallback } from "react";
import useLocation from "@/app/utils/use-location";

export default async function SightingList() {
  const [location, setLocation] = useLocation(SIGHTING_LOCATION_KEY);

  if (!location) {
    return <SightingLocationManager />;
  }

  const sightings: AggregatedSighting[] | undefined =
    await getAggregatedSightings();
  console.log(sightings);
  if (!sightings || sightings.length === 0) {
    return <p>No Sightings</p>;
  }

  return (
    <ul>
      {sightings.map((s: AggregatedSighting) => (
        <li key={s.id} className="pt-4">
          <SightingCard sighting={s} />
        </li>
      ))}
    </ul>
  );
}
