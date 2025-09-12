import { Stack } from "expo-router";
import { Image, StyleSheet } from "react-native";
import FlashMessage from "react-native-flash-message";

const styles = StyleSheet.create({
  logo: {
    width: 100,
    marginLeft: 12,
    resizeMode: "contain",
    height: 50,
  },
  button: {
    marginRight: 12,
  },
});

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        title: "",
        headerLeft: () => (
          <Image
            source={require("../../assets/images/logosmall.png")}
            style={styles.logo}
          />
        ),
      }}
    />
  );
}
