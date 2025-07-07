import { AuthContext, AuthProvider } from "@/components/Provider/auth-provider";
import { Link, useRouter } from "expo-router";
import { View, StyleSheet, Image } from "react-native";
import { Avatar, Button, Card, Text } from "react-native-paper";

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
    //height: 100,
    marginBottom: 20,
    marginTop: 20,
    resizeMode: "contain",
  },
});
