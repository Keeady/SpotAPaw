import { Button, Card, Text } from "react-native-paper";
import { StyleSheet } from "react-native";
import MapView, {
  MapPressEvent,
  Marker,
  PROVIDER_GOOGLE,
} from "react-native-maps";
import { useState } from "react";
import { SightingLocation } from "./get-current-location";

type DropPinOnMapProps = {
  currentLocation?: SightingLocation;
  handleActionButton: (location?: SightingLocation) => void;
};

export default function DropPinOnMap({
  currentLocation,
  handleActionButton,
}: DropPinOnMapProps) {
  const [disabled, setDisabled] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const initialRegion = {
    latitude: currentLocation?.lat ?? 34.05223,
    longitude: currentLocation?.lng ?? -118.24368,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const handleMapPress = (event: MapPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
    setDisabled(false);
  };

  return (
    <Card style={styles.mapCard}>
      <MapView
        style={styles.map}
        region={initialRegion}
        onPress={handleMapPress}
        provider={PROVIDER_GOOGLE}
        showsUserLocation={true}
      >
        {selectedLocation && (
          <Marker
            coordinate={selectedLocation}
            title="Selected Location"
            pinColor="red"
          />
        )}
      </MapView>
      <Card.Content style={styles.mapFooter}>
        <Text style={styles.mapFooterText}>
          {selectedLocation
            ? "Pin placed! Tap button to confirm."
            : "Tap the map to place a pin or double tap to zoom."}
        </Text>
        <Button
          mode="contained"
          onPress={() => {
            handleActionButton({
              lat: selectedLocation?.latitude || 0,
              lng: selectedLocation?.longitude || 0,
            });
            setDisabled(true);
          }}
          disabled={!selectedLocation || disabled}
          style={styles.confirmButton}
        >
          Confirm Location
        </Button>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  mapCard: {
    width: 320,
    marginTop: 8,
    alignSelf: "center",
  },
  map: {
    width: "100%",
    height: 250,
  },
  mapFooter: {
    paddingVertical: 12,
  },
  mapFooterText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  confirmButton: {
    marginTop: 4,
  },
});
