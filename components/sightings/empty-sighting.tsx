import React from "react";
import { Linking, View } from "react-native";
import { Button, Icon, Text } from "react-native-paper";
import { ShowHappyDogAnimation } from "@/components/animate";

type EmptySightingProps = {
  height: number;
  error: string;
  enableFromSettings: boolean;
  setEnableFromSettings: (enabled: boolean) => void;
  reloadPage: () => void;
};

export const EmptySighting = ({ height, error, enableFromSettings, setEnableFromSettings, reloadPage }: EmptySightingProps) => (
  <View
    style={{
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      gap: 20,
      height: height * 0.5,
    }}
  >
    <ShowHappyDogAnimation />
    {error ? (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
          alignContent: "center",
        }}
      >
        <Icon source="alert-circle-outline" size={24} color="red" />
        <Text
          variant="bodyLarge"
          style={{ flex: 1, color: "red", flexWrap: "wrap", textAlign: "center" }}
        >
          {error}
        </Text>
        {!enableFromSettings && (
          <Button
            mode="contained"
            onPress={() => {
              Linking.openSettings();
              setEnableFromSettings(true);
            }}
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
          >
            Reload
          </Button>
        )}
      </View>
    ) : (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <Icon source="paw-outline" size={24} color="green" />
        <Text variant="bodyLarge">
          No pet sightings to display in your area
        </Text>
      </View>
    )}
  </View>
);
