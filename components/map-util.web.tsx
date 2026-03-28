import { Button, Card, Text } from "react-native-paper";
import { StyleSheet } from "react-native";
import { useCallback, useState } from "react";
import { SightingLocation } from "./get-current-location";
import {
  APIProvider,
  Map,
  MapMouseEvent,
  Marker,
} from "@vis.gl/react-google-maps";
import AppConstants from "./constants";

type Pin = {
  latitude: number;
  longitude: number;
  title: string;
};

type DropPinOnMapProps = {
  currentLocation?: SightingLocation;
  handleActionButton: (location?: SightingLocation) => void;
  pins?: Pin[];
};

export default function DropPinOnMap({
  currentLocation,
  handleActionButton,
  pins,
}: DropPinOnMapProps) {
  const [disabled, setDisabled] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const delta = currentLocation ? 0.05 : 50;
  const defaultZoom = currentLocation ? 15 : 4;
  const initialRegion = {
    lat: currentLocation?.lat ?? 45,
    lng: currentLocation?.lng ?? -100,
    latitudeDelta: delta,
    longitudeDelta: delta,
  };

  const handleMapPress = (event: MapMouseEvent) => {
    const latlng = event.detail.latLng;
    if (latlng?.lat && latlng.lng) {
      setSelectedLocation({ latitude: latlng?.lat, longitude: latlng?.lng });
      setDisabled(false);
    }
  };

  const renderMarkerPins = useCallback(() => {
    if (pins && pins.length > 0) {
      return pins.map(
        (pin, i) =>
          pin.latitude &&
          pin.longitude && (
            <Marker
              key={i}
              position={{
                lat: pin.latitude,
                lng: pin.longitude,
              }}
              title={pin.title}
            />
          ),
      );
    }
  }, [pins]);

  return (
    <APIProvider apiKey={AppConstants.EXPO_GOOGLE_MAP_API_KEY_WEB}>
      <Card style={styles.mapCard}>
        <Map
          style={{ width: "90vw", height: "50vh" }}
          defaultCenter={initialRegion}
          defaultZoom={defaultZoom}
          gestureHandling="greedy"
          disableDefaultUI
          onClick={handleMapPress}
        >
          {selectedLocation && (
            <Marker
              position={{
                lat: selectedLocation.latitude,
                lng: selectedLocation.longitude,
              }}
              title="Selected Location"
            />
          )}
          {pins && renderMarkerPins()}
        </Map>
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
    </APIProvider>
  );
}

const styles = StyleSheet.create({
  mapCard: {
    marginHorizontal: 24,
    marginTop: 8,
    alignSelf: "center",
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
