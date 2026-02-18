import React from "react";
import { StyleSheet, View } from "react-native";
import { Icon, Text } from "react-native-paper";
import { ShowHappyDogAnimation } from "@/components/animate";

type EmptySightingProps = {
  error: string;
};

export const EmptySighting = ({ error }: EmptySightingProps) => {
  return (
    <View style={styles.container}>
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
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: 20,
    flexDirection: "column",
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
  },
  content: {
    justifyContent: "center",
    padding: 24,
    flexGrow: 1,
  },
  iconWithText: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
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
});
