import { AggregatedSighting } from "./entities/aggregated-sighting.entity.js";

const publicSightingKeys = [
  "id",
  "createdAt",
  "updatedAt",
  "petId",
  "lastSeenLat",
  "lastSeenLong",
  "lastSeenLocation",
  "lastSeenTime",
  "note",
  "gender",
  "colors",
  "breed",
  "species",
  "features",
  "name",
  "linkedSightingId",
  "isActive",
  "size",
  "collarDescription",
  "age",
  "photos",
  "behavior",
  "petDescriptionId"
] as const satisfies readonly (keyof AggregatedSighting)[];

export type PublicAggregatedSighting = Pick<
  AggregatedSighting,
  (typeof publicSightingKeys)[number]
>;

export function toPublicSighting(
  sighting: AggregatedSighting
): PublicAggregatedSighting {
  return Object.fromEntries(
    publicSightingKeys.map((key) => [key, sighting[key]])
  ) as PublicAggregatedSighting;
}

export function toPublicSightings(
  sightings: AggregatedSighting[]
): PublicAggregatedSighting[] {
  return sightings.map(toPublicSighting);
}
