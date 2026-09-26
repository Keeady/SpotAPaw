import React, { useCallback, useContext } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import DropPinOnMap from "../map-util";
import { SightingLocation } from "../get-current-location";
import DividerWithText from "../divider-with-text";
import { PermissionContext } from "../Provider/permission-provider";
import { useTranslation } from "react-i18next";
import { updateNotificationSubscriptionLocation } from "../notification-util";

export const SightingLocationManager = () => {
  const { t } = useTranslation("sightingpage");
  const { saveLocation, setLocation, refreshPermission } =
    useContext(PermissionContext);

  const onNewLocationSelected = useCallback(
    (location?: SightingLocation) => {
      if (location) {
        saveLocation?.(location);
        setLocation?.(location);
        updateNotificationSubscriptionLocation(location);
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
          {t("setYourLocation", "Set Your Location")}
        </Text>
        <View style={styles.mapContainer}>
          <Text variant="labelLarge" style={styles.infoText}>
            {t(
              "toShowYouNearby",
              "To show you nearby pet sightings, we need to know your location.",
            )}
          </Text>
          <Button
            mode="contained"
            onPress={() => refreshPermission?.()}
            icon={"crosshairs-gps"}
          >
            {t("useMyCurrentLocation", "Use My Current Location")}
          </Button>
        </View>
        <DividerWithText text="or"></DividerWithText>
        <View style={styles.mapContainer}>
          <Text variant="labelLarge" style={styles.infoText}>
            {t("chooseLocationManually", "Choose Location Manually")}
          </Text>
          <DropPinOnMap handleActionButton={onNewLocationSelected} />
        </View>
      </View>
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
