import { AuthProvider } from "@/components/Provider/auth-provider";
import { Slot, Stack } from "expo-router";
import { Alert, Image, StyleSheet } from "react-native";

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

export default function Layout() {
  return (
      <Stack
        screenOptions={{
          headerTitle: () => (
            <Image
              source={require("../../assets/images/logosmall.png")}
              style={styles.logo}
            />
          ),
        }}
      />
  );
}
