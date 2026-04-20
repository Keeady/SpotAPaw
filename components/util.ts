import { Router } from "expo-router";
import * as Location from "expo-location";
import * as chrono from "chrono-node";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AppConstants, { GOOGLE_GEOCODE_URL } from "./constants";
import { AuthHandler } from "@/auth/auth";
import { log } from "./logs";
import { AuthError, PostgrestError } from "@supabase/supabase-js";

export const isValidUuid = (id: string | null | undefined) => {
  return (
    id &&
    id !== undefined &&
    id !== "undefined" &&
    id !== null &&
    id !== "null" &&
    id !== ""
  );
};

export async function handleSignOut(router: Router) {
  const authHandler = new AuthHandler();
  await authHandler.signOut().catch((error) => {
    const errorMessage = createErrorLogMessage(error);
    log(`Sign out failed: ${errorMessage}`);
  });

  router.navigate("/");
}

export async function handleSignIn(router: Router) {
  router.navigate("/");
}

export async function getLastSeenLocation(
  lastSeenLocation?: string | null,
  lastSeenLocationLat?: number | null,
  lastSeenLocationLng?: number | null,
  showFullAddress = true,
) {
  if (!lastSeenLocation && lastSeenLocationLat && lastSeenLocationLng) {
    try {
      const addressObject = await Location.reverseGeocodeAsync({
        longitude: lastSeenLocationLng,
        latitude: lastSeenLocationLat,
      });
      const address = addressObject?.[0];
      if (address) {
        const city = address.city ?? "";
        const street = address.street ?? "";
        const state = address.region ?? "";
        const streetNumber = address.streetNumber ?? "";

        const streetInfo = street ? `${streetNumber} ${street}, ` : "";
        const cityInfo = city ? `${city}, ` : "";

        if (showFullAddress) {
        return `${streetInfo}${cityInfo}${state}`;
        } else {
          return `${cityInfo}${state}`;
        }
      } else {
        return await convertToFullAddress(
          lastSeenLocationLat,
          lastSeenLocationLng,
        );
      }
    } catch (error) {
      const errorMessage = createErrorLogMessage(error);
      log(`Reverse geocoding failed, falling back to coordinates: ${errorMessage}`);
      return await convertToFullAddress(
        lastSeenLocationLat,
        lastSeenLocationLng,
      );
    }
  }

  return lastSeenLocation;
}

export function getIconByAnimalSpecies(species: string) {
  switch (species?.toLowerCase()) {
    case "dog":
      return "dog";
    case "cat":
      return "cat";
    case "rabbit":
      return "rabbit-variant";
    case "horse":
      return "horse-variant";
    case "snake":
      return "snake";
    case "cow":
      return "cow";
    case "pig":
      return "pig";
    case "bird":
      return "bird";
    case "donkey":
      return "donkey";
    case "elephant":
      return "elephant";
    default:
      return "paw";
  }
}

export function convertTime(time: string) {
  // Convert time to ISO 8601 format if possible
  let lastSeenTime = new Date().toISOString();
  if (time) {
    try {
      const convertedDateTime = chrono.parseDate(time, new Date(), {
        forwardDate: false,
      });
      lastSeenTime =
        convertedDateTime?.toISOString() || new Date().toISOString();
    } catch {
      // no action needed
    }
  }

  return lastSeenTime;
}

export const saveStorageItem = async (key: string, value: string) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    const errorMessage = createErrorLogMessage(error);
    log(`Failed to save storage item: ${key} - ${errorMessage}`);
  }
};

export const getStorageItem = async (key: string) => {
  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    const errorMessage = createErrorLogMessage(error);
    log(`Failed to get storage item: ${key} - ${errorMessage}`);
  }
};

export async function convertToFullAddress(lat: number, long: number) {
  const defaultAddress = `${lat.toFixed(6)},${long.toFixed(6)}`;

  return fetch(
    `${GOOGLE_GEOCODE_URL}?latlng=${lat},${long}&key=${AppConstants.EXPO_GOOGLE_GEOCODE_API_KEY}`,
  )
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(
          `Geocode request failed with status ${response.status}`,
        );
      }
    })
    .then((data) => {
      if (data.results && data.results.length > 0) {
        const address = data.results[0].formatted_address;
        return address;
      } else {
        return defaultAddress;
      }
    })
    .catch((error) => {
      const errorMessage = createErrorLogMessage(error);
      log(`Failed to convert coordinates to address: ${errorMessage}`);
      return defaultAddress;
    });
}

export function createErrorLogMessage(error: unknown) {
  if (!error) {
    return "";
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  if (error instanceof PostgrestError  && "message" in error) {
    return error.message;
  }

  if (error instanceof AuthError && "message" in error) {
    return error.message;
  }

  if (typeof error === "object" && "message" in error) {
    return error.message as string;
  }

  return String(error);
}

export function kmToMiles(km: number) {
  return (km * 0.621371).toFixed(0);
}

export function milesToKm(miles: number) {
  return (miles / 0.621371).toFixed(0);
}