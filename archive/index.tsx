import Auth from "@/archive/auth";
import Home from "@/archive/home";
import { AuthContext } from "@/components/Provider/auth-provider";
import { supabase } from "@/components/supabase-client";
import { router } from "expo-router";
import { useContext } from "react";
import { Alert, View } from "react-native";
import { Button } from "react-native-paper";

export default function Index() {
  const auth = useContext(AuthContext);
  const user = auth.user;
  const session = auth.session;

  return (
    <>
      {!user && <Auth />}
      {user && user.id && <Home />}
      {user && user.id && (
        <View>
          <Button mode="outlined" onPress={signOut}>
            Sign Out
          </Button>
        </View>
      )}
    </>
  );
}

async function signOut() {
  let { error } = await supabase.auth.signOut();
  if (error) Alert.alert(error.message);
  else {
    router.navigate("/");
  }
}
