import { createClient } from "@supabase/supabase-js";
import { AppState } from "react-native";
import "react-native-url-polyfill/auto";
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = "https://tdrhuucwalyoftbzwojm.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkcmh1dWN3YWx5b2Z0Ynp3b2ptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3MzQwMzQsImV4cCI6MjA2NDMxMDAzNH0.EOTDj0Z-YeBnEatg-TXwn-L4ovLKFMI46yj4ZbHSvQ8";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Tells Supabase Auth to continuously refresh the session automatically
// if the app is in the foreground. When this is added, you will continue
// to receive `onAuthStateChange` events with the `TOKEN_REFRESHED` or
// `SIGNED_OUT` event if the user's session is terminated. This should
// only be registered once.
/*AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});*/
