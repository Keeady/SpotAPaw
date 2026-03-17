import React, { useCallback, useContext, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import DropPinOnMap from "../map-util";
import { SightingLocation } from "../get-current-location";
import DividerWithText from "../divider-with-text";
import { LocationPermissionDeniedDialog } from "../location-request-util";
import { PermissionContext } from "../Provider/permission-provider";

export const SightingLocationManager = () => {
  const [permissionDeniedDialogVisible, setPermissionDeniedDialogVisible] =
    useState(false);
  const { saveLocation, setLocation, refreshPermission } =
    useContext(PermissionContext);

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
            mode="contained"
            onPress={() => refreshPermission?.()}
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
    paddingBottom: 50,
  },
  mapContainer: {
    flexDirection: "column",
    alignItems: "center",
    alignContent: "center",
    flexWrap: "wrap",
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
