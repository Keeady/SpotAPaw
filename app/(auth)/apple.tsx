import { useEffect } from "react";
import { showMessage } from "react-native-flash-message";
import * as AppleAuthentication from "expo-apple-authentication";
import { log } from "@/components/logs";
import { useRouter } from "expo-router";
import { AuthHandler } from "@/auth/auth";

export default function Auth() {
  const router = useRouter();

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
          .catch(() => {
            showMessage({
              message: "Authentication failed. Please try again.",
              type: "warning",
              icon: "warning",
              statusBarHeight: 50,
            });
            return;
          });
      } else {
        log("No credential found.");
        showMessage({
          message: "Authentication failed. Please try again.",
          type: "warning",
          icon: "warning",
          statusBarHeight: 50,
        });
      }
    } catch {
      log("Apple login failed.");
      showMessage({
        message: "Authentication failed. Please try again.",
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
