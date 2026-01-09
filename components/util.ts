import { Alert } from "react-native";
import { supabase } from "./supabase-client";
import { router } from "expo-router";
import * as Location from "expo-location";
import { log } from "./logs";

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

export async function handleSignOut() {
  let { error } = await supabase.auth.signOut();
  if (error) {
    log(error.message);
    Alert.alert(error.message);
  } else {
    router.navigate("/");
  }
}

export async function getLastSeenLocation(
  lastSeenLocation?: string | null,
  lastSeenLocationLat?: number | null,
  lastSeenLocationLng?: number | null
) {
  if (!lastSeenLocation && lastSeenLocationLat && lastSeenLocationLng) {
    try {
      const addressObject = await Location.reverseGeocodeAsync({
        longitude: lastSeenLocationLng,
        latitude: lastSeenLocationLat,
      });
      const address = addressObject?.[0];
      const city = address.city;
      const street = address.street;
      const state = address.region;
      const streetNumber = address.streetNumber;

      return `${streetNumber} ${street}, ${city}, ${state}`;
    } catch {
      return `${lastSeenLocationLat.toFixed(6)},${lastSeenLocationLng.toFixed(
        6
      )}`;
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
      return "rabbit";
    default:
      return "paw";
  }
}
