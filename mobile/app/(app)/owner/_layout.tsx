import { HeaderLeft } from "@/components/header/header-left";
import HeaderRight from "@/components/header/header-right";
import { Stack } from "expo-router";
import React from "react";

export default function OwnerLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackVisible: true,
        headerBackButtonDisplayMode: "minimal",
        title: "",
        headerRight: HeaderRight,
        headerLeft: HeaderLeft,
      }}
    />
  );
}
