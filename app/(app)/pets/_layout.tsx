import { handleSignOut } from "@/components/util";
import { Stack } from "expo-router";
import React from "react";
import { Image, StyleSheet } from "react-native";
import { Button } from "react-native-paper";

export default function PetLayout() {
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

const styles = StyleSheet.create({
  logo: {
    width: 100,
    marginLeft: 24,
    resizeMode: "contain",
    height: 50,
  },
  button: {
    marginRight: 12,
  },
});
