import { TFunction } from "i18next";
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
  t: TFunction,
): FilterTag[] {
  const FILTER_TAGS: FilterTag[] = [
    {
      icon: "map-marker",
      label: t("lastSeenLocation", "Last seen location", { ns: "translation" }),
      value: lastSeenLocation || "",
      delayMs: 0,
    },
    {
      icon: "paw",
      label: t("lastSeenDate", "Last seen date", { ns: "translation" }),
      value: lastSeenTime,
      delayMs: 200,
    },
    {
      icon: "calendar",
      label: t("dateRange", "Date range", { ns: "translation" }),
      value: t("last30Days", "Last 30 days", { ns: "translation" }),
      delayMs: 400,
    },
    {
      icon: "radar",
      label: t("radius", "Radius", { ns: "translation" }),
      value: radiusMiles,
      delayMs: 600,
    },
    {
      icon: getIconByAnimalSpecies(species),
      label: t("species", "Species", { ns: "translation" }),
      value: t(`animal.${species}`, species, { ns: "translation" }),
      delayMs: 800,
    },
  ];

  return FILTER_TAGS;
}
