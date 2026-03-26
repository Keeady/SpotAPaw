import { AuthProvider } from "@/components/Provider/auth-provider";
import { Stack, useRouter } from "expo-router";
import FlashMessage, { showMessage } from "react-native-flash-message";
import { Linking, View } from "react-native";
import { useEffect } from "react";
import { MD3LightTheme, PaperProvider } from "react-native-paper";
import styles from "@/components/layout.style";
import { PermissionProvider } from "@/components/Provider/permission-provider";
import { AppLifecycleProvider } from "@/components/Provider/app-lifecycle-provider";
import { AIFeatureContextProvider } from "@/components/Provider/ai-context-provider";
import { AuthHandler } from "@/auth/auth";
import HeaderRight from "@/components/header/header-right";
import { HeaderLeft } from "@/components/header/header-left";

export default function Layout() {
  const router = useRouter();

  useEffect(() => {
    const authHandler = new AuthHandler();
    const handleRedirect = async (url: string) => {
      // Let Supabase verify the confirmation link
      await authHandler.exchangeCodeForSession(url);

      // Then send user to the login screen (no auto-login)
      router.replace("/(auth)/signin");
    };

    const handleOAuthRedirect = async (url: string) => {
      const parsedUrl = new URL(url);
      const code = parsedUrl.searchParams.get("code");

      if (code) {
        const { error } = await authHandler.exchangeCodeForSession(code);

        if (error) {
          showMessage({
            message: "Authentication failed. Please try again.",
            type: "warning",
            icon: "warning",
            statusBarHeight: 50,
          });
        } else {
          router.replace("/(app)/my-sightings");
        }
      }
    };

    const handleResetRedirect = async (url: string) => {
      const parsedUrl = new URL(url);
      const code = parsedUrl.searchParams.get("code");

      if (code) {
        const { error } = await authHandler.exchangeCodeForSession(code);

        if (error) {
          showMessage({
            message: "Authentication failed. Please try again.",
            type: "warning",
            icon: "warning",
            statusBarHeight: 50,
          });
        } else {
          router.replace("/(auth)/reset-password");
        }
      }
    };

    // Listener for when app is already open
    const subscription = Linking.addEventListener("url", ({ url }) => {
      if (url && url.indexOf("auth/verify") > -1) {
        handleRedirect(url);
      }

      if (url && url.indexOf("auth/reset") > -1) {
        handleResetRedirect(url);
      }

      if (url && url.indexOf("auth/v1/callback") > -1) {
        handleOAuthRedirect(url);
      }
    });

    // Handle app opening from a cold start
    Linking.getInitialURL().then((url) => {
      if (url && url.indexOf("auth/verify") > -1) {
        handleRedirect(url);
      }

      if (url && url.indexOf("auth/reset") > -1) {
        handleResetRedirect(url);
      }

      if (url && url.indexOf("auth/v1/callback") > -1) {
        handleOAuthRedirect(url);
      }
    });

    return () => subscription.remove();
  }, [router]);

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
