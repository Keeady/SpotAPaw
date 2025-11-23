import * as Location from "expo-location";

export type SightingLocation = {
  lat: number;
  lng: number;
};

export async function getCurrentLocationV2(
  handleChange: (fieldName: string, fieldValue: string | number) => void
) {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    // setErrorMsg('Permission to access location was denied');
    return;
  }

  const location = await Location.getLastKnownPositionAsync({});
  if (location) {
    const address = await Location.reverseGeocodeAsync(location.coords);
    handleChange("last_seen_location", address?.[0].formattedAddress || "");
    handleChange("last_seen_long", location.coords.longitude);
    handleChange("last_seen_lat", location.coords.latitude);
  }
}

export async function getCurrentLocationV1(
  setLocation: (a: string) => void,
  setCoords: (c: Location.LocationObjectCoords) => void
) {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    // setErrorMsg('Permission to access location was denied');
    return;
  }

  const location = await Location.getLastKnownPositionAsync({});
  if (location) {
    const address = await Location.reverseGeocodeAsync(location.coords);
    setLocation(address?.[0].formattedAddress || "");
    setCoords(location.coords);
  }
}

export async function getCurrentUserLocationV3(): Promise<
  SightingLocation | undefined
> {
  const granted = await getUserLocationPermission();

  if (granted) {
    const location = await getUserLocationFast();
    return location;
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

const getUserLocationFast = async (): Promise<SightingLocation> => {
  try {
    // Race between current and last known
    const location = await Promise.race([
      Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      }),
      Location.getLastKnownPositionAsync({
        maxAge: 300000,
        requiredAccuracy: 100,
      }).then((loc) => {
        if (!loc) throw new Error("No cached location");
        return loc;
      }),
    ]);

    return { lat: location.coords.latitude, lng: location.coords.longitude };
  } catch (error) {
    throw new Error("Unable to get user location");
  }
};
