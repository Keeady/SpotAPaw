import { useEffect } from "react";
import { showMessage } from "react-native-flash-message";
import * as AppleAuthentication from "expo-apple-authentication";
import { log } from "@/components/logs";
import { useRouter } from "expo-router";
import { AuthHandler } from "@/auth/auth";
import { createErrorLogMessage } from "@/components/util";
import { useTranslation } from "react-i18next";

export default function Auth() {
  const router = useRouter();
  const { t } = useTranslation("auth");

  async function signInWithApple() {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [AppleAuthentication.AppleAuthenticationScope.EMAIL],
      });
      if (credential.identityToken) {
        const authHandler = new AuthHandler();
        authHandler
          .signInWithIdToken(credential)
          .then(() => {
            router.replace("/(app)/my-sightings");
          })
          .catch((error) => {
            const errorMessage = createErrorLogMessage(error);
            log(`signInWithIdToken: Error signing in ${errorMessage}`);
            showMessage({
              message: t(
                "authenticationFailedPleaseTryAgain",
                "Authentication failed. Please try again.",
              ),
              type: "warning",
              icon: "warning",
              statusBarHeight: 50,
            });
            return;
          });
      } else {
        log("Apple login: No credential found.");
        showMessage({
          message: t(
            "authenticationFailedPleaseTryAgain",
            "Authentication failed. Please try again.",
          ),
          type: "warning",
          icon: "warning",
          statusBarHeight: 50,
        });
      }
    } catch {
      log("Apple login failed.");
      showMessage({
        message: t(
          "authenticationFailedPleaseTryAgain",
          "Authentication failed. Please try again.",
        ),
        type: "warning",
        icon: "warning",
        statusBarHeight: 50,
      });
    }
  }

  useEffect(() => {
    signInWithApple();
  }, []);
}
