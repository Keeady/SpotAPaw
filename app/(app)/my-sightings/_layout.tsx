import styles from "@/components/layout.style";
import { handleSignOut } from "@/components/util";
import { Stack } from "expo-router";
import React from "react";
import { Image } from "react-native";
import { Button } from "react-native-paper";

export default function SightingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackVisible: true,
        headerBackButtonDisplayMode: "minimal",
        title: "",
        headerRight: () => (
          <Button onPress={handleSignOut} style={styles.button}>
            Sign Out
          </Button>
        ),
        headerLeft: () => (
          <Image
            source={require("../../../assets/images/logosmall.png")}
            style={styles.logo}
          />
        ),
      }}
    />
  );
}
