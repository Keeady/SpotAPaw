import { Alert } from "react-native";
import { supabase } from "./supabase-client";
import { router } from "expo-router";

export const isValidUuid = (id: string | null) => {
    return id && id != undefined && id != "undefined" && id != null && id != "null" && id != "";
}

export async function handleSignOut() {
    let { error } = await supabase.auth.signOut();
    if (error) Alert.alert(error.message);
    else {
      router.navigate("/");
    }
  }