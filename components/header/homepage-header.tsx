import { StyleSheet, Image } from "react-native";

export default function HomePageHeader() {
  return (
      <Image
        source={require("../../assets/images/logo.png")}
        style={styles.logo}
      />
  );
}

const styles = StyleSheet.create({
  logo: {
    width: "100%",
    marginTop: 20,
    resizeMode: "contain",
  },
});
