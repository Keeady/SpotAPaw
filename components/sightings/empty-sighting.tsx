import React from "react";
import { View } from "react-native";
import { Icon, Text } from "react-native-paper";
import { ShowHappyDogAnimation } from "@/components/animate";

type EmptySightingProps = {
  height: number;
  error: string;
};

export const EmptySighting = ({ height, error }: EmptySightingProps) => (
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
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Icon source="alert-circle-outline" size={24} color="red" />
        <Text variant="bodyLarge" style={{ color: "red" }}>
          {error}
        </Text>
      </View>
    ) : (
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Icon source="paw-outline" size={24} color="green" />
        <Text variant="bodyLarge">
          No pet sightings to display in your area
        </Text>
      </View>
    )}
  </View>
);
