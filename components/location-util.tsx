import { useState } from "react";
import { Button, TextInput, Text } from "react-native-paper";
import { getCurrentLocationV4 } from "./get-current-location";
import { StyleSheet } from "react-native";
import DropPinOnMap from "./map-util";

type ShowLocationControlsProps = {
  handleChange: (fieldName: string, fieldValue: string | number) => void;
};

export default function ShowLocationControls({
  handleChange,
}: ShowLocationControlsProps) {
  const [lastSeenLocation, setLastSeenLocation] = useState("");

  async function getCurrentLocation() {
    const location = await getCurrentLocationV4();
    if (location) {
      const lastSeenLocation = location.last_seen_location;
      setLastSeenLocation(lastSeenLocation);
      handleChange("last_seen_location", lastSeenLocation);
      handleChange("last_seen_long", location.last_seen_long);
      handleChange("last_seen_lat", location.last_seen_lat);
    }
  }

  return (
    <>
      <Text variant="labelMedium" style={styles.centerText}>
        Tap the map to share location
      </Text>
      <DropPinOnMap
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
        onPress={getCurrentLocation}
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
        onChangeText={(v) => setLastSeenLocation(v)}
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
