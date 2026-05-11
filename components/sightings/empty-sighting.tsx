import React from "react";
import { StyleSheet, View } from "react-native";
import { Icon, Text } from "react-native-paper";
import { ShowHappyDogAnimation } from "@/components/animate";
import { useTranslation } from "react-i18next";

type EmptySightingProps = {
  error: string;
};

export const EmptySighting = ({ error }: EmptySightingProps) => {
  const { t } = useTranslation("sightingpage");
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
            {t("nosightings", "No pet sightings to display in your area")}
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
