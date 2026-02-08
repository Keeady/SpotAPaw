import * as Location from "expo-location";

export type SightingLocation = {
  lat: number;
  lng: number;
  locationAddress?: string;
};

export async function getCurrentLocationV4() {
  try {
    const granted = await getUserLocationPermission();

    if (granted) {
      const location = await getUserLocationFast();
      if (location) {
        const address = await Location.reverseGeocodeAsync(location.coords);
        return {
          last_seen_location: address?.[0].formattedAddress || "",
          last_seen_long: location.coords.longitude,
          last_seen_lat: location.coords.latitude,
        };
      }
    }
  } catch {}
}

export async function getCurrentUserLocationV3(): Promise<
  SightingLocation | undefined
> {
  const granted = await getUserLocationPermission();

  if (granted) {
    const location = await getUserLocationFast();
    if (location) {
      return { lat: location.coords.latitude, lng: location.coords.longitude };
    }
  }
}

async function requestGrantOfUserLocation(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    throw new Error("Location permission not granted");
  }

  return true;
}

const getUserLocationPermission = async () => {
  try {
    // Check current status first
    const { status: existingStatus, canAskAgain } =
      await Location.getForegroundPermissionsAsync();

    if (existingStatus === "granted") {
      return true;
    }

    if (existingStatus === "denied" && !canAskAgain) {
      throw new Error("Cannot Ask Location permission again");
    }

    return requestGrantOfUserLocation();
  } catch {
    throw new Error("Existing Location permission not available");
  }
};

const getUserLocationFast =
  async (): Promise<Location.LocationObject | null> => {
    try {
      // Get the first to fulfill between current and last known
      const location = await Promise.any([
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        }),
        Location.getLastKnownPositionAsync({
          maxAge: 86400000,
          requiredAccuracy: 100,
        }),
      ]);

      if (!location) {
        throw new Error("No location data found");
      }

      return location;
    } catch {
      throw new Error("Unable to get user location");
    }
  };
