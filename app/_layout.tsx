import { AuthProvider } from "@/components/Provider/auth-provider";
import { Stack, useRouter } from "expo-router";
import FlashMessage, { showMessage } from "react-native-flash-message";
import { Image, Linking } from "react-native";
import { useEffect } from "react";
import { supabase } from "@/components/supabase-client";
import { Button, MD3LightTheme, PaperProvider } from "react-native-paper";
import styles from "@/components/layout.style";
import { handleSignIn } from "@/components/util";
import { PermissionProvider } from "@/components/Provider/permission-provider";
import { AppLifecycleProvider } from "@/components/Provider/app-lifecycle-provider";
import { AIFeatureContextProvider } from "@/components/Provider/ai-context-provider";

export default function Layout() {
  const router = useRouter();

  useEffect(() => {
    const handleRedirect = async (url: string) => {
      // Let Supabase verify the confirmation link
      await supabase.auth.exchangeCodeForSession(url);

      // Then send user to the login screen (no auto-login)
      router.replace("/(auth)/signin");
    };

    const handleOAuthRedirect = async (url: string) => {
      const parsedUrl = new URL(url);
      const code = parsedUrl.searchParams.get("code");

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

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

    // Listener for when app is already open
    const subscription = Linking.addEventListener("url", ({ url }) => {
      if (url && url.indexOf("auth/verify") > -1) {
        handleRedirect(url);
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
                headerRight: () => (
                  <Button
                    mode="text"
                    onPress={() => handleSignIn(router)}
                    style={styles.button}
                  >
                    Sign In
                  </Button>
                ),
              }}
            >
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(app)" options={{ headerShown: false }} />
              <Stack.Screen name="terms" options={{ headerShown: true }} />
              <Stack.Screen name="privacy" options={{ headerShown: true }} />
            </Stack>
            <FlashMessage position="top" duration={5000} />
          </AppLifecycleProvider>
          </AIFeatureContextProvider>
        </PermissionProvider>
      </AuthProvider>
    </PaperProvider>
  );
}
