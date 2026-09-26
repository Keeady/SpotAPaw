import { Stack } from "expo-router";
import FlashMessage from "react-native-flash-message";
import { View } from "react-native";
import {
  ActivityIndicator,
  MD3LightTheme,
  PaperProvider,
} from "react-native-paper";
import styles from "@/components/layout.style";
import { PermissionProvider } from "@/components/Provider/permission-provider";
import { AppLifecycleProvider } from "@/components/Provider/app-lifecycle-provider";
import { AIFeatureContextProvider } from "@/components/Provider/ai-context-provider";
import { HeaderLeft } from "@/components/header/header-left";
import { useEffect, useState } from "react";
import { initI18next } from "@/i18n";
import { i18n } from "i18next";
import { createErrorLogMessage } from "@/components/util";
import { log } from "@/components/logs";
import { I18nextProvider } from "react-i18next";

export default function Layout() {
  const [i18nInstance, setI18nInstance] = useState<i18n | null>(null);

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

  if (!i18nInstance) {
    return <ActivityIndicator />;
  }
  return (
    <I18nextProvider i18n={i18nInstance}>
      <PaperProvider theme={MD3LightTheme}>
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
                    }}
                  >
                    <Stack.Screen
                      name="index"
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
                    <Stack.Protected guard={false}>
                      <Stack.Screen name="(auth)" />
                      <Stack.Screen name="(app)" />
                    </Stack.Protected>
                  </Stack>
                  <FlashMessage position="top" duration={5000} />
                </View>
              </View>
            </AppLifecycleProvider>
          </AIFeatureContextProvider>
        </PermissionProvider>
      </PaperProvider>
    </I18nextProvider>
  );
}
