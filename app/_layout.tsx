import { AuthProvider } from "@/components/Provider/auth-provider";
import { Slot, Stack } from "expo-router";
import FlashMessage from "react-native-flash-message";
import { Image, StyleSheet } from "react-native";

export default function Layout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          headerBackVisible: true,
          headerTitle: "",
        }}
      >
        <Stack.Screen name={"index"} />
      </Stack>
      <FlashMessage position="bottom" />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 100,
    marginLeft: 12,
    resizeMode: "contain",
  },
  button: {
    marginRight: 12,
  },
});
