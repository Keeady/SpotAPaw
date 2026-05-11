import { AuthHandler } from "@/auth/auth";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { showMessage } from "react-native-flash-message";
import { Button, Text, TextInput, useTheme } from "react-native-paper";
import isEmail from "validator/es/lib/isEmail";
import { log } from "../logs";
import { createErrorLogMessage } from "../util";
import { useTranslation } from "react-i18next";

export default function ResendEmailScreen() {
  const theme = useTheme();
  const [behavior, setBehavior] = useState<"padding" | undefined>("padding");

  const [loading, setLoading] = useState(false);
  const [disableButton, setDisableButton] = useState(true);
  const router = useRouter();
  const [extra_info, setExtraInfo] = useState("");
  const [hasEmailError, setHasEmailError] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState("");

  const debounceTimer = useRef<number>(null);
  const timeout = useRef<number>(null);
  const { t } = useTranslation(["auth", "translation"]);

  async function resendVerificationWithEmail() {
    if (extra_info.trim()) {
      return;
    }

    if (!confirmationEmail) {
      showMessage({
        message: t("emailRequired", "Email is required. Please try again."),
        type: "warning",
        icon: "warning",
        autoHide: true,
        statusBarHeight: 50,
      });
      return;
    }

    if (!confirmationEmail || !isEmail(confirmationEmail)) {
      setHasEmailError(true);
      return;
    }

    setLoading(true);
    const authHandler = new AuthHandler();
    authHandler
      .resend(confirmationEmail)
      .then(() => {
        showMessage({
          message: t(
            "checkEmailForURL",
            "Please check your email for the confirmation URL.",
          ),
          type: "success",
          icon: "success",
          autoHide: true,
          statusBarHeight: 50,
        });
      })
      .catch((error) => {
        const errorMessage = createErrorLogMessage(error);
        log(`Failed to resend confirmation email: ${errorMessage}`);
        showMessage({
          message: t(
            "failedToResendConfirmationEmail",
            "Failed to resend confirmation email. Please try again.",
          ),
          type: "warning",
          icon: "warning",
          autoHide: true,
          statusBarHeight: 50,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      if (confirmationEmail) {
        setHasEmailError(!isEmail(confirmationEmail));
      } else {
        setHasEmailError(false);
      }
    }, 500);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [confirmationEmail]);

  useEffect(() => {
    if (timeout.current) {
      clearTimeout(timeout.current);
    }

    timeout.current = setTimeout(() => {
      setDisableButton(false);
    }, 600000);

    return () => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
    };
  }, []);

  useEffect(() => {
    const showListener = Keyboard.addListener("keyboardDidShow", () => {
      setBehavior("padding");
    });
    const hideListener = Keyboard.addListener("keyboardDidHide", () => {
      setBehavior(undefined);
    });

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={behavior}
      keyboardVerticalOffset={100}
    >
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.headerTitle}>
          {t("welcome", "Welcome!", { ns: "translation" })}
        </Text>
        <Text style={styles.headerSubtitle}>
          {t("joinCommunity", "Join a community of pets and pet lovers", {
            ns: "translation",
          })}
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingVertical: 20 }}>
          <Text variant="titleLarge" style={{ textAlign: "center" }}>
            {t(
              "checkEmailForConfirmation",
              "Check your email for confirmation link or re-enter email to resend confirmation",
            )}
          </Text>
          <View style={[styles.verticallySpaced, styles.mt10]}>
            <Text variant="labelSmall" style={{ color: "red" }}>
              {hasEmailError
                ? t("invalidEmailAddress", "Invalid email address.", {
                    ns: "translation",
                  })
                : ""}
            </Text>
            <TextInput
              label={t("email", "Email", { ns: "translation" })}
              left={<TextInput.Icon icon="mail" />}
              onChangeText={(text) => {
                setConfirmationEmail(text);
              }}
              value={confirmationEmail}
              placeholder="email@address.com"
              autoCapitalize={"none"}
              mode="outlined"
              keyboardType="email-address"
              error={hasEmailError}
            />
          </View>

          <View style={[styles.verticallySpaced, styles.mt20]}>
            <Button
              mode="contained"
              disabled={loading || hasEmailError || disableButton}
              onPress={() => resendVerificationWithEmail()}
              style={styles.button}
            >
              {t("resend", "Resend")}
            </Button>
          </View>
        </View>

        <View>
          <View style={styles.secondary}>
            <Text>
              {t("alreadyHaveAnAccount", "Already have an account?", {
                ns: "auth",
              })}
            </Text>
            <Button
              mode="text"
              disabled={loading}
              onPress={() => router.push("/(auth)/signin")}
            >
              {t("signIn", "Sign in", { ns: "translation" })}
            </Button>
          </View>
          <TextInput
            style={{ height: 0, opacity: 0 }}
            value={extra_info}
            onChangeText={setExtraInfo}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    backgroundColor: "#fff",
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: "stretch",
  },
  mt20: {
    marginTop: 20,
  },
  mt10: {
    marginTop: 10,
  },
  secondary: {
    flexDirection: "row",
    alignItems: "baseline",
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: "center",
  },
  content: {
    paddingHorizontal: 16,
    flexGrow: 1,
    justifyContent: "space-between",
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
