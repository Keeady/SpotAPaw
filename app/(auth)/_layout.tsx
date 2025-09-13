import { AuthContext } from "@/components/Provider/auth-provider";
import { Stack, useRouter } from "expo-router";
import { useContext, useEffect } from "react";
import { Image, StyleSheet } from "react-native";

const styles = StyleSheet.create({
  logo: {
    width: 100,
    marginLeft: 0,
    resizeMode: "contain",
    height: 50,
  },
  button: {
    marginRight: 12,
  },
});

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackVisible: true,
        headerBackButtonDisplayMode: "minimal",
        headerTitle: () => (
          <Image
            source={require("../../assets/images/logosmall.png")}
            style={styles.logo}
          />
        ),
      }}
    >
      <Stack.Screen name={"signin"} />
      <Stack.Screen name={"signup"} />
    </Stack>
  );
}
