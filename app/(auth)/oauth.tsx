import { useEffect } from "react";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import { showMessage } from "react-native-flash-message";
import { AuthHandler } from "@/auth/auth";
import { log } from "@/components/logs";
import { createErrorLogMessage } from "@/components/util";

// Required for web browser to close properly on iOS
WebBrowser.maybeCompleteAuthSession();

export default function Auth() {
  const redirectUrl = makeRedirectUri({
    scheme: "spotapaw",
    path: "auth/v1/callback",
  });

  async function signInWithGoogle() {
    try {
      const authHandler = new AuthHandler();
      const { data } = await authHandler.signInWithOAuth(redirectUrl);
      if (data?.url) {
        // Open the OAuth URL in a browser
        await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
      }
    } catch (error) {
      const errorMessage = createErrorLogMessage(error);
      log(`signInWithOAuth failed: ${errorMessage}`);
      showMessage({
        message: "Authentication failed. Please try again.",
        type: "warning",
        icon: "warning",
        statusBarHeight: 50,
      });
    }
  }

  useEffect(() => {
    signInWithGoogle();
  }, []);
}
