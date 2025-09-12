import { Stack } from "expo-router";
import { Image, StyleSheet } from "react-native";

const styles = StyleSheet.create({
  logo: {
    width: 100,
    marginLeft: 0,
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
        headerBackVisible: true,
        headerBackButtonDisplayMode: "minimal",
        headerTitle: () => (
          <Image
            source={require("../../assets/images/logosmall.png")}
            style={styles.logo}
          />
        ),
      }}
    >
      <Stack.Screen name={"index"} />
      <Stack.Screen name={"new"} />
      <Stack.Screen name={"contact"} />
    </Stack>
  );
}
