import DividerWithText from "@/components/divider-with-text";
import HomePageHeader from "@/components/header/homepage-header";
import { AuthContext } from "@/components/Provider/auth-provider";
import { Redirect, useRouter } from "expo-router";
import { useContext } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

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
      </View>

      <View>
        <Text variant="titleMedium" style={styles.largeText}>
          A community helping lost pets find their way home.
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        <Button
          icon="google"
          mode="contained"
          onPress={() => router.push("/(auth)/oauth")}
          style={styles.button}
        >
          Continue with Google
        </Button>

        <DividerWithText text="or continue with email and password" />

        <Button
          icon=""
          mode="elevated"
          onPress={() => router.push("/(auth)/signin")}
          style={styles.button}
        >
          Sign In
        </Button>
        <Button
          icon=""
          mode="outlined"
          onPress={() => router.push("/(auth)/signup")}
          style={styles.button}
        >
          Create an account
        </Button>

        <DividerWithText text="or continue without an account" />

        <Button
          icon=""
          mode="text"
          style={styles.button}
          onPress={() => router.push("/sightings/")}
        >
          Continue as Guest
        </Button>
      </View>
      <View style={styles.bottomSection}>
        <View style={styles.usageText}>
          <Text variant="bodySmall" style={{ textAlign: "center" }}>
            By using this app, you agree to our
          </Text>
          <Button mode="text" onPress={() => router.push("/privacy")} compact>
            <Text
              variant="bodySmall"
              style={{ textDecorationLine: "underline" }}
            >
              Privacy Policy
            </Text>
          </Button>
          <Text variant="bodySmall" style={{ textAlign: "center" }}>
            and
          </Text>
          <Button mode="text" onPress={() => router.push("/terms")} compact>
            <Text
              variant="bodySmall"
              style={{ textDecorationLine: "underline" }}
            >
              Terms of Service.
            </Text>
          </Button>
        </View>

        <Text variant="bodySmall">
          SpotAPaw &#169; {new Date().getFullYear()}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    backgroundColor: "#fff",
    flexDirection: "column",
  },
  content: {
    alignItems: "center",
  },
  button: {
    width: "100%",
    marginBottom: 16,
  },
  buttonContainer: {
    width: "100%",
  },
  logoContainer: {
    width: "100%",
    alignItems: "center",
  },
  largeText: {
    textAlign: "center",
    marginBottom: 20,
  },
  bottomSection: {
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    gap: 8
  },
  usageText: {
    flexDirection: "row",
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
  },
});