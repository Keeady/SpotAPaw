import React from "react";
import { TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import styles from "../layout.style";

export const HeaderLeft = () => {
  const router = useRouter();

  return (
    <TouchableOpacity onPress={() => router.push("/")}>
      <Image
        source={require("../../assets/images/spotapaw-text-logo-v2.png")}
        style={styles.logo}
      />
    </TouchableOpacity>
  );
};
