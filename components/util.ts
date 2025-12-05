import { Alert } from "react-native";
import { supabase } from "./supabase-client";
import { router } from "expo-router";
import { PetReportData } from "./sightings/sighting-interface";
import * as Location from "expo-location";

export const isValidUuid = (id: string | null) => {
  return (
    id &&
    id != undefined &&
    id != "undefined" &&
    id != null &&
    id != "null" &&
    id != ""
  );
};

export async function handleSignOut() {
  let { error } = await supabase.auth.signOut();
  if (error) Alert.alert(error.message);
  else {
    router.navigate("/");
  }
}

export async function getLastSeenLocation(report: PetReportData) {
  if (
    !report.lastSeenLocation &&
    report.lastSeenLocationLat &&
    report.lastSeenLocationLng
  ) {
    try {
      const address = await Location.reverseGeocodeAsync({
        longitude: report.lastSeenLocationLng,
        latitude: report.lastSeenLocationLat,
      });
      return address?.[0].formattedAddress || "";
    } catch {
      return `${report.lastSeenLocationLat.toFixed(
        6
      )},${report.lastSeenLocationLng.toFixed(6)}`;
    }
  }

  return report.lastSeenLocation;
}
