import OneTimePasscodeScreen from "@/components/account/one-time-code";
import ResetPasswordForEmailScreen from "@/components/account/reset-email";
import DividerWithText from "@/components/divider-with-text";
import { useState } from "react";
import { Platform, ScrollView, StyleSheet, View } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";

export default function ForgotScreen() {
  const theme = useTheme();
  const [showOneTimePasscodeLogin, setShowOneTimePasscodeLogin] =
    useState(false);

  const [showResetPassword, setShowResetPassword] = useState(false);

  if (showOneTimePasscodeLogin) {
    return <OneTimePasscodeScreen />;
  }

  if (showResetPassword) {
    return <ResetPasswordForEmailScreen />;
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.headerTitle}>Welcome Back!</Text>
        <Text style={styles.headerSubtitle}>
          Help find and protect our furry friends
        </Text>
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
        <View style={styles.buttonContainer}>
          <View style={[styles.verticallySpaced, styles.mt20]}>
            <Button
              mode="contained"
              onPress={() => setShowResetPassword(true)}
              style={styles.button}
            >
              Reset your password.
            </Button>
          </View>

          <DividerWithText text="OR" />

          <View style={[styles.verticallySpaced, styles.mt20]}>
            <Button
              mode="outlined"
              onPress={() => setShowOneTimePasscodeLogin(true)}
              style={styles.button}
            >
              Login with one time passcode.
            </Button>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: "stretch",
  },
  mt20: {
    marginTop: 20,
  },
  container: {
    flex: 1,
    paddingTop: 10,
    backgroundColor: "#fff",
    flexDirection: "column",
  },
  content: {
    justifyContent: "space-between",
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    backgroundColor: "#714ea9ff",
    paddingVertical: 16,
    paddingTop: Platform.OS === "ios" ? 50 : 16,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#BBDEFB",
    marginTop: 4,
  },
  button: {
    width: "100%",
    marginBottom: 16,
    borderWidth: 1,
    borderRadius: 12,
  },
  buttonContainer: {
    width: "100%",
  },
});
