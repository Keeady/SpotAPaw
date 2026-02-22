import styles from "@/components/layout.style";
import { handleSignOut } from "@/components/util";
import { Stack, useRouter } from "expo-router";
import React from "react";
import { Image } from "react-native";
import { Button } from "react-native-paper";

export default function OwnerLayout() {
  const router = useRouter();
  return (
    <Stack
      screenOptions={{
        headerBackVisible: true,
        headerBackButtonDisplayMode: "minimal",
        title: "",
        headerRight: () => (
          <Button onPress={() => handleSignOut(router)} style={styles.button}>
            Sign Out
          </Button>
        ),
        headerLeft: () => (
          <Image
            source={require("../../../assets/images/spotapaw-text-logo-v2.png")}
            style={styles.logo}
          />
        ),
      }}
    />
  );
}
