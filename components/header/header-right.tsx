import React, { useContext } from "react";
import { useRouter } from "expo-router";
import { AuthContext } from "../Provider/auth-provider";
import { handleSignOut } from "../util";
import { Button } from "react-native-paper";
import styles from "../layout.style";
import { useTranslation } from "react-i18next";

export default function HeaderRight() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const {t} = useTranslation("translation");

  if (!user) {
    return (
      <Button
        onPress={() => router.push("/(auth)/signin")}
        style={styles.button}
      >
        {t("signIn")}
      </Button>
    );
  }

  return (
    <Button onPress={() => handleSignOut(router)} style={styles.button}>
      {t("signOut")}
    </Button>
  );
}
