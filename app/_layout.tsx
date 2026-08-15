import { AuthContext, AuthProvider } from "@/components/Provider/auth-provider";
import { Stack, useRouter } from "expo-router";
import FlashMessage, { showMessage } from "react-native-flash-message";
import { Linking, View } from "react-native";
import { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  MD3LightTheme,
  PaperProvider,
} from "react-native-paper";
import styles from "@/components/layout.style";
import { PermissionProvider } from "@/components/Provider/permission-provider";
import { AppLifecycleProvider } from "@/components/Provider/app-lifecycle-provider";
import { AIFeatureContextProvider } from "@/components/Provider/ai-context-provider";
import { AuthHandler } from "@/auth/auth";
import HeaderRight from "@/components/header/header-right";
import { HeaderLeft } from "@/components/header/header-left";
import { createErrorLogMessage } from "@/components/util";
import { log } from "@/components/logs";
import { I18nextProvider } from "react-i18next";
import { initI18next } from "@/i18n";
import { LocaleContextProvider } from "@/components/Provider/locale-provider";
import type { i18n } from "i18next";
import { ProContextProvider } from "@/components/Provider/pro-context-provider";
import { registerForNotifications } from "@/components/notification-util";
import { NotificationPermissionProvider } from "@/components/Provider/notification-permission-provider";
import * as Notifications from "expo-notifications";
import { TelemetryProvider } from "@/instrumentation/telemetry-provider";

export default function Layout() {
  const router = useRouter();
  const [i18nInstance, setI18nInstance] = useState<i18n | null>(null);

  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }, []);

  useEffect(() => {
    initI18next()
      .then((v) => {
        setI18nInstance(v);
      })
      .catch((error) => {
        const errorMessage = createErrorLogMessage(error);
        log(`i18next initialization failed: ${errorMessage}`);
      });
  }, []);

  useEffect(() => {
    const authHandler = new AuthHandler();
    const handleRedirect = async (url: string) => {
      // Let Supabase verify the confirmation link
      const { error } = await authHandler.exchangeCodeForSession(url);

      if (error) {
        const errorMessage = createErrorLogMessage(error);
        log(`Redirect exchangeCodeForSession failed: ${errorMessage}`);
      }

      // Then send user to the login screen (no auto-login)
      router.replace("/(auth)/signin");
    };

    const handleOAuthRedirect = async (url: string) => {
      const parsedUrl = new URL(url);
      const code = parsedUrl.searchParams.get("code");

      if (code) {
        const { error } = await authHandler.exchangeCodeForSession(code);

        if (error) {
          const errorMessage = createErrorLogMessage(error);
          log(`OAuth exchangeCodeForSession failed: ${errorMessage}`);
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
          const errorMessage = createErrorLogMessage(error);
          log(`Reset exchangeCodeForSession failed: ${errorMessage}`);
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

  useEffect(() => {
    registerForNotifications();
  }, []);

  if (!i18nInstance) {
    return <ActivityIndicator />;
  }

  return (
    <TelemetryProvider>
      <I18nextProvider i18n={i18nInstance}>
        <PaperProvider theme={MD3LightTheme}>
          <NotificationPermissionProvider>
            <LocaleContextProvider>
              <AuthProvider>
                <PermissionProvider>
                  <ProContextProvider>
                    <AIFeatureContextProvider>
                      <AppLifecycleProvider>
                        <App />
                      </AppLifecycleProvider>
                    </AIFeatureContextProvider>
                  </ProContextProvider>
                </PermissionProvider>
              </AuthProvider>
            </LocaleContextProvider>
          </NotificationPermissionProvider>
        </PaperProvider>
      </I18nextProvider>
    </TelemetryProvider>
  );
}

function App() {
  const router = useRouter();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const sightingRoute = user ? "/(app)/my-sightings" : "/sightings";

    const response = Notifications.getLastNotificationResponse();
    if (response) {
      const data = response.notification.request.content.data;
      if (data?.sightingId) {
        router.push(
          `${sightingRoute}/${data.sightingId}?linkedSightingId=${data.linkedSightingId}&petId=${data.petId}`,
        );

        Notifications.dismissNotificationAsync(
          response.notification.request.identifier,
        );
      }
    }

    const notificationResponseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        if (data && data.sightingId) {
          router.push(
            `${sightingRoute}/${data.sightingId}?linkedSightingId=${data.linkedSightingId}&petId=${data.petId}`,
          );
        }
      });

    const notificationReceivedListener =
      Notifications.addNotificationReceivedListener((notification) => {
        const data = notification.request.content.data;
        if (data && data.sightingId) {
          router.push(
            `${sightingRoute}/${data.sightingId}?linkedSightingId=${data.linkedSightingId}&petId=${data.petId}`,
          );
        }
      });

    return () => {
      notificationResponseListener.remove();
      notificationReceivedListener.remove();
    };
  }, [router, user]);

  return (
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
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(app)" options={{ headerShown: false }} />
          <Stack.Screen name="terms" options={{ headerShown: true }} />
          <Stack.Screen name="privacy" options={{ headerShown: true }} />
        </Stack>
        <FlashMessage position="top" duration={5000} />
      </View>
    </View>
  );
}
