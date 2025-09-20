import { AuthProvider } from "@/components/Provider/auth-provider";
import { Stack } from "expo-router";
import FlashMessage from "react-native-flash-message";
import { Image, StyleSheet } from "react-native";

export default function Layout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerShown: true,
          headerBackVisible: true,
          headerBackButtonDisplayMode: "minimal",
          headerTitle: () => (
            <Image
              source={require("../assets/images/logosmall.png")}
              style={styles.logo}
            />
          ),
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      </Stack>
      <FlashMessage position="bottom" duration={5000} />
    </AuthProvider>
  );
}

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
