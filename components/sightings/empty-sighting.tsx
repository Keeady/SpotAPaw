import React from "react";
import { Linking, View } from "react-native";
import { Button, Icon, Text } from "react-native-paper";
import { ShowHappyDogAnimation } from "@/components/animate";

type EmptySightingProps = {
  error: string;
  enableFromSettings: boolean;
  setEnableFromSettings: (enabled: boolean) => void;
  reloadPage: () => void;
};

export const EmptySighting = ({
  error,
  enableFromSettings,
  setEnableFromSettings,
  reloadPage,
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
        }}
      >
        <Icon source="alert-circle-outline" size={24} color="red" />
        <Text
          variant="bodyLarge"
          style={{
            flex: 1,
            color: "red",
            flexWrap: "wrap",
            textAlign: "center",
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
        }}
      >
        <Icon source="paw-outline" size={24} color="green" />
        <Text
          variant="bodyLarge"
          style={{
            flex: 1,
            flexWrap: "wrap",
            textAlign: "center",
          }}
        >
          No pet sightings to display in your area
        </Text>
      </View>
    )}

    {!enableFromSettings && (
      <Button
        mode="contained"
        onPress={() => {
          Linking.openSettings();
          setEnableFromSettings(true);
        }}
        compact={true}
        style={{ paddingHorizontal: 10, marginTop: 10 }}
      >
        Enable Location Access
      </Button>
    )}
    {enableFromSettings && (
      <Button
        mode="contained"
        onPress={() => {
          reloadPage();
        }}
        compact={true}
        style={{ paddingHorizontal: 10, marginTop: 10 }}
      >
        Reload
      </Button>
    )}
  </View>
);
