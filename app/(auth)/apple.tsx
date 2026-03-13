import { useEffect } from "react";
import { supabase } from "@/components/supabase-client";
import { showMessage } from "react-native-flash-message";
import * as AppleAuthentication from "expo-apple-authentication";
import { log } from "@/components/logs";
import { useRouter } from "expo-router";

export default function Auth() {
  const router = useRouter();

  async function signInWithApple() {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [AppleAuthentication.AppleAuthenticationScope.EMAIL],
      });
      if (credential.identityToken) {
        const { error } = await supabase.auth.signInWithIdToken({
          provider: "apple",
          token: credential.identityToken,
        });
        if (error) {
          log(error.message);
          showMessage({
          message: "Authentication failed. Please try again.",
          type: "warning",
          icon: "warning",
          statusBarHeight: 50,
        });
          return;
        }

        router.replace("/(app)/my-sightings");
      } else {
        log("No credential found.")
        showMessage({
          message: "Authentication failed. Please try again.",
          type: "warning",
          icon: "warning",
          statusBarHeight: 50,
        });
      }
    } catch {
      log("Apple login failed.")
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
