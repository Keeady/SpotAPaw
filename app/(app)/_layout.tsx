import { AuthContext } from "@/components/Provider/auth-provider";
import { supabase } from "@/components/supabase-client";
import { Redirect, router, Stack, Tabs } from "expo-router";
import React, { useContext } from "react";
import { Alert, Image, StyleSheet } from "react-native";
import FlashMessage from "react-native-flash-message";
import { Button, Icon, Text } from "react-native-paper";

export default function AppLayout() {
  const auth = useContext(AuthContext);
  const user = auth.user;

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
    <>
      <Tabs
        screenOptions={{
          ///headerStyle: { height: 10 },
          title: "",
          headerRight: () => <Button onPress={handleSignOut}>Sign Out</Button>,
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
          name="sightings"
          options={{
            tabBarIcon: ({ size }) => (
              <Icon source={"eye-check-outline"} size={size} />
            ),
            title: "Sightings",
            headerTitle: "",
          }}
        />
      </Tabs>
      <FlashMessage position="bottom" />
    </>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 100,
    //height: 10,
    //marginBottom: 40,
    //marginTop: 40,
    resizeMode: "contain",
    //backgroundColor: "red"
  },
});
/*
 */
