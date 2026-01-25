import React from "react";
import { StyleSheet, View } from "react-native";
import { Icon, Text } from "react-native-paper";
import { ShowHappyDogAnimation } from "@/components/animate";
import DropPinOnMap from "../map-util";
import { SightingLocation } from "../get-current-location";

type EmptySightingProps = {
  error: string;
  hasLocation: boolean;
  onLocationSelected: (location?: SightingLocation) => void;
};

export const EmptySighting = ({
  error,
  hasLocation,
  onLocationSelected,
}: EmptySightingProps) => (
  <View style={styles.container}>
    {!hasLocation && (
      <View style={styles.mapContainer}>
        <View style={styles.iconWithText}>
          <Icon source="alert-circle-outline" size={32} color="blue" />
          <Text variant="labelLarge" style={styles.infoText}>
            Tap on the map to select your location. Results will be shown near
            this location.
          </Text>
        </View>
        <DropPinOnMap handleActionButton={onLocationSelected} />
      </View>
    )}

    {hasLocation && (
      <View style={styles.mapContainer}>
        <ShowHappyDogAnimation />
        {error ? (
          <View style={styles.iconWithText}>
            <Icon source="alert-circle-outline" size={32} color="red" />
            <Text variant="bodyLarge" style={styles.errorText}>
              {error}
            </Text>
          </View>
        ) : (
          <View style={styles.iconWithText}>
            <Icon source="paw-outline" size={32} color="green" />
            <Text variant="bodyLarge" style={styles.successText}>
              No pet sightings to display in your area
            </Text>
          </View>
        )}
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignContent: "center",
    alignItems: "center",
    flexDirection: "column",
    gap: 20,
    flex: 1,
    paddingTop: 100,
  },
  mapContainer: {
    flexDirection: "column",
    alignItems: "center",
    flexWrap: "wrap",
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 8,
  },
  iconWithText: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 8,
  },
  successText: {
    flex: 1,
    flexWrap: "wrap",
    color: "green",
  },
  errorText: {
    flex: 1,
    color: "red",
    flexWrap: "wrap",
  },
  infoText: {
    flex: 1,
    color: "blue",
    flexWrap: "wrap",
  },
});
