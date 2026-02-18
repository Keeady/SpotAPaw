import React, { useCallback, useContext, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import DropPinOnMap from "../map-util";
import {
  getCurrentUserLocationV3,
  SightingLocation,
} from "../get-current-location";
import DividerWithText from "../divider-with-text";
import { LocationPermissionDeniedDialog } from "../location-request-util";
import { PermissionContext } from "../Provider/permission-provider";

export const SightingLocationManager = () => {
  const [permissionDeniedDialogVisible, setPermissionDeniedDialogVisible] =
    useState(false);
  const { saveLocation, setLocation } = useContext(PermissionContext);

  const onLocationPermissionRequested = useCallback(() => {
    getCurrentUserLocationV3()
      .then((location) => {
        if (location) {
          saveLocation?.(location);
          setLocation?.(location);
        }
      })
      .catch(() => {
        setPermissionDeniedDialogVisible(true);
      });
  }, [saveLocation, setLocation]);

  const onNewLocationSelected = useCallback(
    (location?: SightingLocation) => {
      if (location) {
        saveLocation?.(location);
        setLocation?.(location);
      }
    },
    [saveLocation, setLocation],
  );

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
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
          <DropPinOnMap handleActionButton={onNewLocationSelected} />
        </View>
      </View>

      {/* Permission Denied Dialog */}
      <LocationPermissionDeniedDialog
        permissionDeniedDialogVisible={permissionDeniedDialogVisible}
        setPermissionDeniedDialogVisible={setPermissionDeniedDialogVisible}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    justifyContent: "center",
    padding: 24,
    flexGrow: 1,
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
  infoText: {
    flex: 1,
    flexWrap: "wrap",
  },
  promptTitle: {
    alignSelf: "center",
    marginBottom: 10,
  },
});
