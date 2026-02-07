import { AuthContext } from "@/components/Provider/auth-provider";
import { Redirect, Tabs } from "expo-router";
import React, { useContext } from "react";
import { Icon } from "react-native-paper";

export default function AppLayout() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null;

  if (!user) {
    return <Redirect href={"/(auth)/signin"} />;
  }
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="my-sightings"
        options={{
          tabBarIcon: ({ size }) => (
            <Icon source={"map-marker-multiple"} size={size} />
          ),
          title: "Sightings",
          headerTitle: "",
        }}
      />
      <Tabs.Screen
        name="pets"
        options={{
          tabBarIcon: ({ size }) => <Icon source={"paw"} size={size} />,
          title: "My Pets",
          headerTitle: "",
        }}
      />
      <Tabs.Screen
        name="owner"
        options={{
          tabBarIcon: ({ size }) => (
            <Icon source={"account"} size={size} />
          ),
          title: "My Profile",
          headerTitle: "",
        }}
        
      />

      <Tabs.Screen
        name="my-settings"
        options={{
          tabBarIcon: ({ size }) => <Icon source={"cog"} size={size} />,
          title: "Settings",
          headerTitle: "",
        }}
      />
    </Tabs>
  );
}
