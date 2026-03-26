import React, { useContext } from "react";
import { useRouter } from "expo-router";
import { AuthContext } from "../Provider/auth-provider";
import { handleSignOut } from "../util";
import { Button } from "react-native-paper";
import styles from "../layout.style";

export default function HeaderRight() {
  const router = useRouter();
  const { user } = useContext(AuthContext);

  if (!user) {
    return (
      <Button
        onPress={() => router.push("/(auth)/signin")}
        style={styles.button}
      >
        Sign In
      </Button>
    );
  }

  return (
    <Button onPress={() => handleSignOut(router)} style={styles.button}>
      Sign Out
    </Button>
  );
}
