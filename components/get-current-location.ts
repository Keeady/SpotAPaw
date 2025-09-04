import * as Location from "expo-location";

export async function getCurrentLocation(
    //setLocation: (a: string) => void, 
    //setCoords: (c: Location.LocationObjectCoords) => void
    handleChange: (fieldName: string, fieldValue: string | number) => void) {
  const { status } = await Location.requestForegroundPermissionsAsync();
  console.log(status)
  if (status !== "granted") {
    // setErrorMsg('Permission to access location was denied');
    return;
  }

  const location = await Location.getLastKnownPositionAsync({});
  console.log(location)
  if (location) {
    const address = await Location.reverseGeocodeAsync(location.coords);
    console.log("address", address)
    //setLocation(address?.[0].formattedAddress || "");
    //setCoords(location.coords);
    handleChange("last_seen_location", address?.[0].formattedAddress || "")
    handleChange("last_seen_long", location.coords.longitude)
    handleChange("last_seen_lat", location.coords.latitude)

  } else {
    console.log("no location")
  }
}
