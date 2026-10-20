import { Sighting } from "./entities/sighting.entity.js";

const publicSightingKeys = [
  "id",
  "createdAt",
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
] as const satisfies readonly (keyof Sighting)[];

export type PublicSighting = Pick<
  Sighting,
  (typeof publicSightingKeys)[number]
>;

export function toPublicSighting(
  sighting: Sighting
): PublicSighting {
  return Object.fromEntries(
    publicSightingKeys.map((key) => [key, sighting[key]])
  ) as PublicSighting;
}

export function toPublicSightings(
  sightings: Sighting[]
): PublicSighting[] {
  return sightings.map(toPublicSighting);
}
