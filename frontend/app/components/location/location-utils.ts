import { getStorageItem, saveStorageItem } from "../../utils/local-storage";
import { SightingLocation } from "./location-types";

export const SIGHTING_LOCATION_KEY = "sightingLocation";

export const getSavedLocation = async () => {
  try {
    const location = await getStorageItem(SIGHTING_LOCATION_KEY);
    if (location) {
      return JSON.parse(location);
    }
  } catch {
    return;
  }
};

export const saveLocation = (location: SightingLocation) => {
  saveStorageItem(SIGHTING_LOCATION_KEY, JSON.stringify(location));
};
