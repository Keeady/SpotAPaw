import React, { useCallback, useEffect, useRef, useState } from "react";
import { AppState, Linking, StyleSheet, View } from "react-native";
import { Button, Icon, Text } from "react-native-paper";
import { ShowHappyDogAnimation } from "@/components/animate";
import DropPinOnMap from "../map-util";
import {
  getCurrentUserLocationV3,
  SightingLocation,
} from "../get-current-location";
import DividerWithText from "../divider-with-text";
import { LocationPermissionDeniedDialog } from "../location-request-util";

type EmptySightingProps = {
  error: string;
  hasLocation: boolean;
  onLocationSelected: (location?: SightingLocation) => void;
  onRetryLocationRequest: () => void;
};

export const EmptySighting = ({
  error,
  hasLocation,
  onLocationSelected,
  onRetryLocationRequest,
}: EmptySightingProps) => {
  const appState = useRef(AppState.currentState);
  const [permissionDeniedDialogVisible, setPermissionDeniedDialogVisible] =
    useState(false);

  const onLocationPermissionRequested = useCallback(() => {
    getCurrentUserLocationV3()
      .then((location) => {
        onLocationSelected(location);
      })
      .catch(() => {
        setPermissionDeniedDialogVisible(true);
      });
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      // When app comes back to foreground from background
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        // User returned from settings, check permission status
        onRetryLocationRequest();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      {!hasLocation && (
        <View>
          <Text variant="titleLarge" style={styles.promptTitle}>
            Set Your Location
          </Text>
          <View style={styles.mapContainer}>
            <Text variant="labelLarge" style={styles.infoText}>
              To show you nearby pet sightings, we need to know your location.
            </Text>
            <Button
              mode="text"
              onPress={() => onLocationPermissionRequested()}
              icon={"crosshairs-gps"}
            >
              Use My Current Location
            </Button>
          </View>
          <DividerWithText text="or"></DividerWithText>
          <View style={styles.mapContainer}>
            <Text variant="labelLarge" style={styles.infoText}>
              Choose Location Manually
            </Text>
            <DropPinOnMap handleActionButton={onLocationSelected} />
          </View>
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
      {/* Permission Denied Dialog */}
      <LocationPermissionDeniedDialog
        permissionDeniedDialogVisible={permissionDeniedDialogVisible}
        setPermissionDeniedDialogVisible={setPermissionDeniedDialogVisible}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  mapContainer: {
    flexDirection: "column",
    alignItems: "center",
    alignContent: "center",
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
    backgroundColor: "red",
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
    flexWrap: "wrap",
  },
  promptTitle: {
    alignSelf: "center",
    marginBottom: 10,
  },
});
