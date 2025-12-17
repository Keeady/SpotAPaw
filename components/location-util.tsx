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
  const [showMap, setShowMap] = useState(false);
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
      {!showMap && (
        <>
          <TextInput
            label={"Last Seen Location"}
            placeholder="Enter Street names, Cross Streets, Signs, Markers"
            value={lastSeenLocation}
            onChangeText={(v) => setLastSeenLocation(v)}
            mode={"outlined"}
          />
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
        </>
      )}
      {showMap && (
        <DropPinOnMap
          handleActionButton={(location) => {
            if (location) {
              handleChange("last_seen_long", location?.lng);
              handleChange("last_seen_lat", location?.lat);
              handleChange("last_seen_location", "");
            }
          }}
        />
      )}
      <Button
        icon={"map-marker-circle"}
        onPress={() => setShowMap(!showMap)}
        mode="elevated"
        style={styles.button}
      >
        <Text>{showMap ? "Close Map" : "Drop pin on map"}</Text>
      </Button>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 20,
    marginBottom: 10,
  },
});
