import { AuthContext, AuthProvider } from "@/components/Provider/auth-provider";
import { supabase } from "@/components/supabase-client";
import { Redirect, router, Stack, Tabs } from "expo-router";
import React, { useContext } from "react";
import { Alert, Image, StyleSheet } from "react-native";
import { Avatar, Button, Icon } from "react-native-paper";
import FlashMessage from "react-native-flash-message";

export default function RootLayout() {
  const auth = useContext(AuthContext);
  const user = auth.user;

  async function handleSignOut() {
    let { error } = await supabase.auth.signOut();
    if (error) Alert.alert(error.message);
    else {
      router.navigate("/");
    }
  }

  if (!user) {
    return <Redirect href={"/(auth)/signin"} />;
  }
  return (
    <>

    <Stack
      screenOptions={{
        headerStyle: {height: 10},        
        title: "",
        headerRight: () => <Button onPress={handleSignOut}>Sign Out</Button>,
        headerLeft: () => (
          <Image
            source={require("../../assets/images/logosmall.png")}
            style={styles.logo}
          />
        ),
      }}
      >
        </Stack>
    <FlashMessage position="bottom" />
    </>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 100,
    //height: 10,
    //marginBottom: 40,
    //marginTop: 40,
    resizeMode: "contain",
    //backgroundColor: "red"
  },
});
    /*
    */