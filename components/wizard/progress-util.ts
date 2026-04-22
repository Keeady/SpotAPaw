import { getIconByAnimalSpecies } from "../util";

export interface FilterTag {
  icon: string;
  label: string;
  value: string;
  delayMs: number;
}

export function buildFilterTags(
  lastSeenLocation: string,
  lastSeenTime: string,
  radiusMiles: string,
  species: string,
): FilterTag[] {
  const FILTER_TAGS: FilterTag[] = [
    {
      icon: "map-marker",
      label: "Last seen location",
      value: lastSeenLocation || "",
      delayMs: 0,
    },
    {
      icon: "paw",
      label: "Last seen date",
      value: lastSeenTime,
      delayMs: 200,
    },
    {
      icon: "calendar",
      label: "Date range",
      value: "Last 30 days",
      delayMs: 400,
    },
    {
      icon: "radar",
      label: "Radius",
      value: radiusMiles,
      delayMs: 600,
    },
    {
      icon: getIconByAnimalSpecies(species),
      label: "Species",
      value: species,
      delayMs: 800,
    },
  ];

  return FILTER_TAGS;
}
