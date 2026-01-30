import { useEffect } from "react";
import { Alert } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import { supabase } from "@/components/supabase-client";

// Required for web browser to close properly on iOS
WebBrowser.maybeCompleteAuthSession();

export default function Auth() {
  const redirectUrl = makeRedirectUri({
    scheme: "spotapaw",
    path: "auth/v1/callback",
  });

  async function signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: false,
        },
      });

      if (error) {
        Alert.alert("Error", error.message);
        return;
      }

      if (data?.url) {
        // Open the OAuth URL in a browser
        await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUrl,
        );

        
      }
    } catch (error) {
      Alert.alert("An error ocurred");
    }
  }

  useEffect(() => {
    signInWithGoogle();
  }, []);
}
