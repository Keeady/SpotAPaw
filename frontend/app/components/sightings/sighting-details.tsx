"use client";

import {
  AggregatedSighting,
  Sighting,
} from "@/lib/sightings/agregated-sighting";
import { SightingLocation } from "../location/location-types";
import SightingDetailRenderer from "./sighting-details-renderer";

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
  const noop = () => void 0;
  return (
    <SightingDetailRenderer
      sightings={sightings}
      summary={summary}
      currentLocation={currentLocation}
      onAddSighting={noop}
      isOwner={isOwner}
      onShareSighting={noop}
      onEdit={noop}
      onPetFound={noop}
      onViewMatches={noop}
      onViewPoster={noop}
      hasOwner={hasOwner}
      claimed={claimed}
    />
  );
}

