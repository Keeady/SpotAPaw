import HomePageHeader from "@/components/header/homepage-header";
import { AuthContext } from "@/components/Provider/auth-provider";
import { Redirect, useRouter } from "expo-router";
import { useContext } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { useTranslation } from "react-i18next";

export default function PublicHome() {
  const { t } = useTranslation(["index", "translation"]);

  const router = useRouter();
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return null;
  }

  if (user) {
    return <Redirect href={"/(app)/my-sightings"} />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.logoContainer}>
        <HomePageHeader />
        <View>
          <Text variant="titleMedium" style={styles.largeText}>
            {t("title")}
          </Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          icon="login"
          mode="contained"
          onPress={() => router.push("/(auth)/signin")}
          style={styles.button}
        >
          {t("signIn")}
        </Button>
        <Button
          icon="account-plus-outline"
          mode="outlined"
          onPress={() => router.push("/(auth)/signup")}
          style={styles.button}
        >
          {t("createAnAccount", {ns: "translation"})}
        </Button>

        <Button
          icon=""
          mode="text"
          style={styles.button}
          onPress={() => router.push("/sightings/")}
        >
          {t("continueAsGuest")}
        </Button>

        <View style={styles.usageText}>
          <Text variant="bodySmall">{t("byUsing")}</Text>
          <Button mode="text" onPress={() => router.push("/about")} compact>
            <Text
              variant="bodySmall"
              style={{ textDecorationLine: "underline" }}
            >
              SpotAPaw,
            </Text>
          </Button>
          <Text variant="bodySmall">{t("youAgreeToOur")}</Text>
          <Button mode="text" onPress={() => router.push("/privacy")} compact>
            <Text
              variant="bodySmall"
              style={{ textDecorationLine: "underline" }}
            >
              {t("privacyPolicy")}
            </Text>
          </Button>
          <Text variant="bodySmall">{t("and")}</Text>
          <Button mode="text" onPress={() => router.push("/terms")} compact>
            <Text
              variant="bodySmall"
              style={{ textDecorationLine: "underline" }}
            >
              {t("termsOfService")}
            </Text>
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: "#fff",
    flexDirection: "column",
  },
  content: {
    alignItems: "center",
    flexGrow: 1,
  },
  button: {
    width: "100%",
    marginBottom: 12,
    borderWidth: 1,
    borderRadius: 12,
  },
  buttonContainer: {
    width: "100%",
  },
  logoContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 2,
  },
  largeText: {
    textAlign: "center",
  },
  usageText: {
    flexDirection: "row",
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 16,
  },
});
