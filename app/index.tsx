import HomePageHeader from "@/components/header/homepage-header";
import { AuthContext } from "@/components/Provider/auth-provider";
import { Redirect, useRouter } from "expo-router";
import { useContext } from "react";
import { Platform, ScrollView, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import * as AppleAuthentication from "expo-apple-authentication";
import DividerWithText from "@/components/divider-with-text";

export default function PublicHome() {
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
        <View style={styles.largeTextContainer}>
          <Text variant="titleMedium" style={styles.largeText}>
            A community helping lost pets find their way home.
          </Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        {Platform.OS === "ios" && (
          <View style={[styles.verticallySpaced, styles.mt20]}>
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={
                AppleAuthentication.AppleAuthenticationButtonType.CONTINUE
              }
              buttonStyle={
                AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
              }
              cornerRadius={12}
              style={[styles.button, { height: 48 }]}
              onPress={() => router.push("/(auth)/apple")}
            />
          </View>
        )}

        {Platform.OS === "ios" && <DividerWithText text="OR" />}
        <Button
          icon="login"
          mode="contained"
          onPress={() => router.push("/(auth)/signin")}
          style={styles.button}
        >
          Continue with Email
        </Button>

        <DividerWithText text="OR" />

        <Button
          icon=""
          mode="text"
          style={styles.button}
          onPress={() => router.push("/sightings/")}
        >
          Continue as Guest
        </Button>

        <View style={styles.usageText}>
          <Text variant="bodySmall">By using </Text>
          <Button mode="text" onPress={() => router.push("/about")} compact>
            <Text
              variant="bodySmall"
              style={{ textDecorationLine: "underline" }}
            >
              SpotAPaw,
            </Text>
          </Button>
          <Text variant="bodySmall"> you agree to our</Text>
          <Button mode="text" onPress={() => router.push("/privacy")} compact>
            <Text
              variant="bodySmall"
              style={{ textDecorationLine: "underline" }}
            >
              Privacy Policy
            </Text>
          </Button>
          <Text variant="bodySmall">and</Text>
          <Button mode="text" onPress={() => router.push("/terms")} compact>
            <Text
              variant="bodySmall"
              style={{ textDecorationLine: "underline" }}
            >
              Terms of Service
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
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
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
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: "stretch",
  },
  mt20: {
    marginTop: 20,
  },
  largeTextContainer: {
    marginTop: 24,
  },
});
