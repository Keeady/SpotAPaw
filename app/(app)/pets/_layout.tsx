import { log } from "@/components/logs";
import { supabase } from "@/components/supabase-client";
import { Stack, useRouter } from "expo-router";
import React from "react";
import { Alert, Image, StyleSheet } from "react-native";
import { Button } from "react-native-paper";

export default function PetLayout() {
  const router = useRouter();

  async function handleSignOut() {
    let { error } = await supabase.auth.signOut();
    if (error) {
      log(error.message);
      Alert.alert(error.message);
    } else {
      router.navigate("/");
    }
  }

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
