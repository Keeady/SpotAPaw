import React from "react";
import { Linking, View } from "react-native";
import { Button, Icon, Text } from "react-native-paper";
import { ShowHappyDogAnimation } from "@/components/animate";

type EmptySightingProps = {
  error: string;
  enableFromSettings: boolean;
  reloadPage: () => void;
  hasLocation: boolean;
};

export const EmptySighting = ({
  error,
  enableFromSettings,
  reloadPage,
  hasLocation,
}: EmptySightingProps) => (
  <View
    style={{
      alignContent: "center",
      alignItems: "center",
      flexDirection: "column",
      gap: 20,
      flex: 1,
      paddingTop: 100,
    }}
  >
    <View>
      <ShowHappyDogAnimation />
    </View>

    {error ? (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          flexWrap: "wrap",
          flex: 1,
          paddingHorizontal: 8,
          paddingVertical: 4,
          gap: 8,
        }}
      >
        <Icon source="alert-circle-outline" size={32} color="red" />
        <Text
          variant="bodyLarge"
          style={{
            flex: 1,
            color: "red",
            flexWrap: "wrap",
          }}
        >
          {error}
        </Text>
      </View>
    ) : (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          flexWrap: "wrap",
          flex: 1,
          paddingHorizontal: 8,
          paddingVertical: 4,
          gap: 8,
        }}
      >
        <Icon source="paw-outline" size={32} color="green" />
        <Text
          variant="bodyLarge"
          style={{
            flex: 1,
            flexWrap: "wrap",
            color: "green",
          }}
        >
          No pet sightings to display in your area
        </Text>
      </View>
    )}

    {enableFromSettings && !hasLocation && (
      <Button
        mode="contained"
        onPress={() => {
          Linking.openSettings();
        }}
        compact={true}
        style={{ paddingHorizontal: 10, marginTop: 10 }}
      >
        Enable Location Access
      </Button>
    )}
    {enableFromSettings && (
      <Button
        mode="outlined"
        onPress={() => {
          reloadPage();
        }}
        compact={true}
        style={{ paddingHorizontal: 10, marginTop: 10 }}
      >
        Reload
      </Button>
    )}

    {enableFromSettings && (
      <Text
        variant="labelMedium"
        style={{ paddingHorizontal: 10, marginTop: 10 }}
      >
        Please click Enable Location Access button to open permission settings,
        grant Location Permission for this app then click the Reload button to
        apply the changes.
      </Text>
    )}
  </View>
);
