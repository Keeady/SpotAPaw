import "client-only";
import { GUEST_SIGHTINGS_KEY, Sighting, SightingsResponse } from "./sighting";

export async function getGuestSightings(): Promise<
  SightingsResponse<Sighting[]>
> {
  try {
    if (!window || !window.localStorage || !localStorage) {
      return {
        data: undefined,
        error: "Failed to fetch sightings.",
        errorCode: "",
      }; 
    }
    const storage = window.localStorage ?? localStorage;

    const sightingIds = storage.getItem(GUEST_SIGHTINGS_KEY);

    if (!sightingIds || sightingIds.length === 0) {
      return {
        data: undefined,
        error: "No sightings found",
        errorCode: "",
      };
    }

    const host = process.env.NEXT_PUBLIC_API_HOST;
    if (!host) {
      return { error: "Invalid endpoint api.", data: undefined, errorCode: "" };
    }

    const res = await fetch(`${host}/sightings?sightingIds={sightingIds}`);

    if (!res.ok) {
      return {
        data: undefined,
        error: "Failed to fetch sightings",
        errorCode: "",
      };
    }
    const data = await res.json();
    return { data, error: undefined, errorCode: undefined };
  } catch (error) {
    console.error("Error reading guest reports from localStorage", error);
    return {
      data: undefined,
      error: "Failed to fetch sightings",
      errorCode: "",
    };
  }
}
