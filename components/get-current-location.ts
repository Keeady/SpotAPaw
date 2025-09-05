import * as Location from "expo-location";

export async function getCurrentLocationV2(
  handleChange: (fieldName: string, fieldValue: string | number) => void,
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
