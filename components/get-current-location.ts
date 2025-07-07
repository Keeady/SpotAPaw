import * as Location from "expo-location";

export async function getCurrentLocation(
    setLocation: (a: string) => void, 
    setCoords: (c: Location.LocationObjectCoords) => void) {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    // setErrorMsg('Permission to access location was denied');
    return;
  }

  const location = await Location.getCurrentPositionAsync({});
  if (location) {
    const address = await Location.reverseGeocodeAsync(location.coords);
    setLocation(address?.[0].formattedAddress || "");
  }
  setCoords(location.coords);
}
