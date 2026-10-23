import EmptySighting from "@/app/components/sightings/empty-sightings";
import { getAggregatedSightingById } from "@/lib/sightings/get-aggregated-sighting-detail";
import SightingDetail from "@/app/components/sightings/sighting-details";
import { getSavedSearchLocation } from "../action";

export default async function SightingById({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ linkedSightingId: string }>;
}) {
  const { id } = await params;
  const { linkedSightingId } = await searchParams;
  const currentLocation = await getSavedSearchLocation();
  const { data, error } = await getAggregatedSightingById({
    aggregatedSightingId: id,
    linkedSightingId
  });

  if (!data) {
    return <EmptySighting error={error} />;
  }

  const isOwner = false;
  return (
    <div className="flex w-full flex-col gap-6">
      <SightingDetail
        sightings={data.sightings}
        summary={data.summary}
        currentLocation={currentLocation}
        isOwner={isOwner}
        hasOwner={data.hasOwner}
        claimed={data.claimed}
      />
    </div>
  );
}
