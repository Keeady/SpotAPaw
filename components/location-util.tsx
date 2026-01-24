import { useCallback, useEffect, useState } from "react";
import { Button, TextInput, Text } from "react-native-paper";
import { getCurrentLocationV4, SightingLocation } from "./get-current-location";
import { StyleSheet } from "react-native";
import DropPinOnMap from "./map-util";

type ShowLocationControlsProps = {
  handleChange: (fieldName: string, fieldValue: string | number) => void;
};

export default function ShowLocationControls({
  handleChange,
}: ShowLocationControlsProps) {
  const [lastSeenLocation, setLastSeenLocation] = useState("");
  const [sightingLocation, setSightingLocation] = useState<SightingLocation>();

  async function getCurrentLocation() {
    const location = await getCurrentLocationV4();
    if (location) {
      const lastSeenLocation = location.last_seen_location;
      const lastSeenLocationLat = location.last_seen_lat;
      const lastSeenLocationLong = location.last_seen_long;
      setSightingLocation({
        lat: lastSeenLocationLat,
        lng: lastSeenLocationLong,
        locationAddress: lastSeenLocation,
      });
    }
  }

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getSavedUserCurrentLocation = useCallback(() => {
    if (sightingLocation) {
      setLastSeenLocation(sightingLocation.locationAddress || "");
      handleChange(
        "last_seen_location",
        sightingLocation?.locationAddress || "",
      );
      handleChange("last_seen_long", sightingLocation.lng);
      handleChange("last_seen_lat", sightingLocation.lat);
    }
  }, [sightingLocation]);

  return (
    <>
      <Text variant="labelMedium" style={styles.centerText}>
        Tap the map to share location
      </Text>
      <DropPinOnMap
        currentLocation={sightingLocation}
        handleActionButton={(location) => {
          if (location) {
            handleChange("last_seen_long", location?.lng);
            handleChange("last_seen_lat", location?.lat);
            handleChange("last_seen_location", "");
          }
        }}
      />

      <Text variant="labelLarge" style={styles.centerText}>
        Or
      </Text>
      <Button
        icon={"map-marker-radius-outline"}
        onPress={getSavedUserCurrentLocation}
        mode="elevated"
        style={styles.button}
      >
        <Text>
          {lastSeenLocation ? "Location saved" : "Use My Current Location"}
        </Text>
      </Button>
      <TextInput
        label={"Last Seen Location"}
        value={lastSeenLocation}
        mode={"outlined"}
        editable={false}
      />
    </>
  );
}

const styles = StyleSheet.create({
  centerText: {
    alignSelf: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  button: {
    marginTop: 10,
    marginBottom: 10,
  },
});
