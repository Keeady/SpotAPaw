import { Stack } from "expo-router";
import FlashMessage from "react-native-flash-message";
import { Image } from "react-native";
import { MD3LightTheme, PaperProvider } from "react-native-paper";
import styles from "@/components/layout.style";
import { PermissionProvider } from "@/components/Provider/permission-provider";
import { AppLifecycleProvider } from "@/components/Provider/app-lifecycle-provider";
import { AIFeatureContextProvider } from "@/components/Provider/ai-context-provider";

export default function Layout() {
  return (
    <PaperProvider theme={MD3LightTheme}>
      <PermissionProvider>
        <AIFeatureContextProvider>
          <AppLifecycleProvider>
            <Stack
              screenOptions={{
                headerShown: true,
                headerBackVisible: true,
                headerBackButtonDisplayMode: "minimal",
                headerTitle: () => (
                  <Image
                    source={require("../assets/images/spotapaw-text-logo-v2.png")}
                    style={styles.logo}
                  />
                ),
              }}
            >
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="terms" options={{ headerShown: true }} />
              <Stack.Screen name="privacy" options={{ headerShown: true }} />
              <Stack.Protected guard={false}>
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(app)" />
              </Stack.Protected>
            </Stack>
            <FlashMessage position="top" duration={5000} />
          </AppLifecycleProvider>
        </AIFeatureContextProvider>
      </PermissionProvider>
    </PaperProvider>
  );
}
