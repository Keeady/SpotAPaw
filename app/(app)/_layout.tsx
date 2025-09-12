import { AuthContext } from "@/components/Provider/auth-provider";
import { supabase } from "@/components/supabase-client";
import { Redirect, Stack, Tabs, useRouter } from "expo-router";
import React, { useContext } from "react";
import { Alert, Image, StyleSheet } from "react-native";
import { Button, Icon, Text } from "react-native-paper";

export default function AppLayout() {
  const auth = useContext(AuthContext);
  const user = auth.user;
  const router = useRouter();

  async function handleSignOut() {
    let { error } = await supabase.auth.signOut();
    if (error) Alert.alert(error.message);
    else {
      router.navigate("/");
    }
  }

  if (!user) {
    return <Redirect href={"/(auth)/signin"} />;
  }
  return (
    <Tabs
      screenOptions={{
        title: "",
        headerRight: () => (
          <Button onPress={handleSignOut} style={styles.button}>
            Sign Out
          </Button>
        ),
        headerLeft: () => (
          <Image
            source={require("../../assets/images/logosmall.png")}
            style={styles.logo}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="pets"
        options={{
          tabBarIcon: ({ size }) => <Icon source={"paw"} size={size} />,
          title: "Pets",
          headerTitle: "",
        }}
      />
      <Tabs.Screen
        name="owner"
        options={{
          tabBarIcon: ({ size }) => (
            <Icon source={"account-box-outline"} size={size} />
          ),
          title: "Profile",
          headerTitle: "",
        }}
      />
      <Tabs.Screen
        name="my-sightings"
        options={{
          tabBarIcon: ({ size }) => (
            <Icon source={"eye-check-outline"} size={size} />
          ),
          title: "Sightings",
          headerTitle: "",
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 100,
    marginLeft: 24,
    resizeMode: "contain",
  },
  button: {
    marginRight: 12,
  },
});
