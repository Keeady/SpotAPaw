import { getAggregatedSightings } from "@/lib/sightings/get-aggregated-sightings";
import SightingCard from "./sighting-card";
import { AggregatedSighting } from "@/lib/sightings/agregated-sighting";
import { SightingLocationManager } from "@/app/components/location/manager";
import {
  getSavedLocation,
  SIGHTING_LOCATION_KEY,
} from "@/app/components/location/location-utils";
import { useCallback } from "react";
import useLocation from "@/app/utils/use-location";
import { cookies } from "next/headers";
import { getSavedSearchLocation, saveSearchLocation } from "./action";

export default async function SightingList() {
  const location = await getSavedSearchLocation();
  if (!location) {
    return <SightingLocationManager onLocationSelected={saveSearchLocation} />;
  }

  const sightings: AggregatedSighting[] | undefined =
    await getAggregatedSightings({
      latitude: location.latitude,
      longitude: location.longitude,
    });
  if (!sightings || sightings.length === 0) {
    return <p>No Sightings</p>;
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <ul>
        {sightings.map((s: AggregatedSighting) => (
          <li key={s.id} className="pt-4">
            <SightingCard sighting={s} currentLocation={location} />
          </li>
        ))}
      </ul>
    </div>
  );
}
