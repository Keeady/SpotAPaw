import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";
import AppConstants from "./constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

export const supabase = createClient(
  AppConstants.EXPO_PUBLIC_SUPABASE_URL || "",
  AppConstants.EXPO_PUBLIC_SUPABASE_ANON_KEY || "",
  {
    auth: {
      storageKey: "spotapaw",
      detectSessionInUrl: false,
      ...(Platform.OS !== "web" ? { storage: AsyncStorage } : {}),
      autoRefreshToken: true,
      persistSession: true,
      flowType: "pkce",
    },
  },
);
