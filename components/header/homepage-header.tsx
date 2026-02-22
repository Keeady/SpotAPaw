import { StyleSheet, Image, useWindowDimensions } from "react-native";

export default function HomePageHeader() {
  const { width } = useWindowDimensions();

  return (
    <Image
      source={require("../../assets/images/spotapaw-text-logo-large-v2.png")}
      style={[styles.logo, { width }]}
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    resizeMode: "contain",
    height: 250,
  },
});
