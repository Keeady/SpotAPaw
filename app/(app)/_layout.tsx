import { AuthContext } from "@/components/Provider/auth-provider";
import { Redirect, Tabs } from "expo-router";
import React, { useContext } from "react";
import { Icon } from "react-native-paper";

export default function AppLayout() {
  const auth = useContext(AuthContext);
  const user = auth.user;

  if (!user) {
    return <Redirect href={"/(auth)/signin"} />;
  }
  return (
    <Tabs screenOptions={{ headerShown: false }}>
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
