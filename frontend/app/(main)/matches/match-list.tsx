import { SightingLocationManager } from "@/app/components/location/manager";
import { getMatches } from "@/lib/matches/get-matches";
import {
  getSavedSearchLocation,
  saveSearchLocation,
} from "../aggregated-sightings/action";
import { MatchCard } from "./match-card";

export async function MatchesList({
  searchParams,
}: {
  searchParams: Promise<{ sightingId: string }>;
}) {
  const { sightingId } = await searchParams;

  const location = await getSavedSearchLocation();
  if (!location) {
    return <SightingLocationManager onLocationSelected={saveSearchLocation} />;
  }

  const { data } = await getMatches(sightingId);

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 p-8 text-center">
        <p className="text-lg font-medium">No Matches Found Yet</p>
        <p className="text-sm text-gray-600">
          We will keep looking. Come back soon as new sightings are reported
          every day.
        </p>
      </div>
    );
  }

  const visible = data
    .filter((m) => m.sighting)
    .sort((a, b) => b.score - a.score);

  if (visible.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 p-8 text-center">
        <p className="text-lg font-medium">No Matches Found Yet</p>
        <p className="text-sm text-gray-600">
          We will keep looking. Come back soon as new sightings are reported
          every day.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {visible.map((m) => (
        <MatchCard
          key={m.id}
          match={m}
          currentLocation={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
        />
      ))}
    </div>
  );
}
