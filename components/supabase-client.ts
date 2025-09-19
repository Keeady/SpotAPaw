import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";
import AppConstants from "./constant";

export const supabase = createClient(
  AppConstants.EXPO_PUBLIC_SUPABASE_URL || "",
  AppConstants.EXPO_PUBLIC_SUPABASE_ANON_KEY || ""
);
