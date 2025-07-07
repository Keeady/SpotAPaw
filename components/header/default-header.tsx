import { AuthContext, AuthProvider } from "@/components/Provider/auth-provider";
import { Link, useRouter } from "expo-router";
import { View, StyleSheet, Image } from "react-native";
import { Avatar, Button, Card, Text } from "react-native-paper";

export default function DefaultPageHeader() {
  return (
    <Image
      source={require("../../assets/images/logosmall.png")}
      style={styles.logo}
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 100,
    height: 50,
    marginBottom: 20,
    marginTop: 40,
    resizeMode: "contain",
    alignSelf: "flex-start",
    backgroundColor: "#fff"
  },
});
