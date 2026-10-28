"use client";

import {
  AggregatedSighting,
  Sighting,
} from "@/lib/sightings/agregated-sighting";
import { SightingLocation } from "../location/location-types";
import SightingDetailRenderer from "./sighting-details-renderer";
import { useCallback } from "react";
import { useRouter } from "next/navigation";

type SightingDetailProps = {
  currentLocation: SightingLocation;
  sightings: Sighting[];
  summary: AggregatedSighting;
  claimed: boolean;
  hasOwner: boolean;
  isOwner: boolean;
};

export default function SightingDetail({
  currentLocation,
  sightings,
  summary,
  claimed,
  hasOwner,
  isOwner,
}: SightingDetailProps) {
  const route = useRouter();
  const noop = () => void 0;
  const onViewPoster = useCallback(() => {
    if (!summary.posterId && !summary.id) {
      return;
    }

    route.push(
      `/posters/?posterId=${summary.posterId}&sightingId=${summary.id}`,
    );
  }, [summary.posterId]);

  const onViewMatches = useCallback(() => {
    if (!summary.id) {
      return;
    }

    route.push(`/matches/?sightingId=${summary.id}`);
  }, [summary.id]);

  return (
    <SightingDetailRenderer
      sightings={sightings}
      summary={summary}
      currentLocation={currentLocation}
      onAddSighting={undefined}
      isOwner={isOwner}
      onShareSighting={undefined}
      onEdit={undefined}
      onPetFound={undefined}
      onViewMatches={onViewMatches}
      onViewPoster={onViewPoster}
      hasOwner={hasOwner}
      claimed={claimed}
    />
  );
}
