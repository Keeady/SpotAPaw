import { AuthProvider } from "@/components/Provider/auth-provider";
import { Stack, useRouter } from "expo-router";
import FlashMessage from "react-native-flash-message";
import { Image, Linking, StyleSheet } from "react-native";
import { useEffect } from "react";
import { supabase } from "@/components/supabase-client";
import { MD3LightTheme, PaperProvider } from "react-native-paper";

export default function Layout() {
  const router = useRouter();

  useEffect(() => {
    const handleRedirect = async (url: string) => {
      // Let Supabase verify the confirmation link
      await supabase.auth.exchangeCodeForSession(url);

      // Then send user to the login screen (no auto-login)
      router.replace("/(auth)/signin");
    };

    // Listener for when app is already open
    const subscription = Linking.addEventListener("url", ({ url }) => {
      if (url && url.indexOf("auth/verify") > -1) {
        handleRedirect(url);
      }
    });

    // Handle app opening from a cold start
    Linking.getInitialURL().then((url) => {
      if (url && url.indexOf("auth/verify") > -1) {
        handleRedirect(url);
      }
    });

    return () => subscription.remove();
  }, [router]);

  return (
    <PaperProvider theme={MD3LightTheme}>
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
          <Stack.Screen name="terms" options={{ headerShown: false }} />
          <Stack.Screen name="privacy" options={{ headerShown: false }} />
        </Stack>
        <FlashMessage position="bottom" duration={5000} />
      </AuthProvider>
    </PaperProvider>
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
