import { AuthProvider } from "@/components/Provider/auth-provider";
import { Stack } from "expo-router";
import FlashMessage from "react-native-flash-message";
import { View } from "react-native";
import { MD3LightTheme, PaperProvider } from "react-native-paper";
import styles from "@/components/layout.style";
import { PermissionProvider } from "@/components/Provider/permission-provider";
import { AppLifecycleProvider } from "@/components/Provider/app-lifecycle-provider";
import { AIFeatureContextProvider } from "@/components/Provider/ai-context-provider";
import HeaderRight from "@/components/header/header-right";
import { HeaderLeft } from "@/components/header/header-left";

export default function Layout() {
  return (
    <PaperProvider theme={MD3LightTheme}>
      <AuthProvider>
        <PermissionProvider>
          <AIFeatureContextProvider>
            <AppLifecycleProvider>
              <View style={styles.root}>
                <View style={styles.container}>
                  <Stack
                    screenOptions={{
                      contentStyle: styles.content,
                      headerShown: true,
                      headerBackVisible: true,
                      headerBackButtonDisplayMode: "minimal",
                      headerTitle: HeaderLeft,
                      headerRight: HeaderRight,
                    }}
                  >
                    <Stack.Screen
                      name="index"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="(app)"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="terms"
                      options={{ headerShown: true }}
                    />
                    <Stack.Screen
                      name="privacy"
                      options={{ headerShown: true }}
                    />
                  </Stack>
                  <FlashMessage position="top" duration={5000} />
                </View>
              </View>
            </AppLifecycleProvider>
          </AIFeatureContextProvider>
        </PermissionProvider>
      </AuthProvider>
    </PaperProvider>
  );
}
