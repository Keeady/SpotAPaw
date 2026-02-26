import { log } from "@/components/logs";
import { supabase } from "@/components/supabase-client";
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
import {
  Button,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import isEmail from "validator/es/lib/isEmail";

export default function ResendEmailScreen() {
  const theme = useTheme();
  const [behavior, setBehavior] = useState<"padding" | undefined>("padding");

  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [extra_info, setExtraInfo] = useState("");
  const [hasEmailError, setHasEmailError] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState("");

  const debounceTimer = useRef<number>(null);

  async function resendVerificationWithEmail() {
    if (extra_info.trim()) {
      return;
    }

    if (!confirmationEmail) {
      showMessage({
        message: "Email is required. Please try again.",
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
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: confirmationEmail,
    });

    if (error) {
      log(error.message);
      showMessage({
        message: "An error occurred. Please try again.",
        type: "warning",
        icon: "warning",
        autoHide: true,
        statusBarHeight: 50,
      });
    } else {
      showMessage({
        message: "Please check your email for the confirmation URL.",
        type: "success",
        icon: "success",
        autoHide: true,
        statusBarHeight: 50,
      });
    }

    setLoading(false);
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
        <Text style={styles.headerTitle}>Welcome!</Text>
        <Text style={styles.headerSubtitle}>
          Join a community of pets and pet lovers
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
            Check your email for confirmation link or re-enter email to resend
            confirmation
          </Text>
          <View style={[styles.verticallySpaced, styles.mt10]}>
            <Text variant="labelSmall" style={{ color: "red" }}>
              {hasEmailError ? "Invalid email address." : ""}
            </Text>
            <TextInput
              label="Email"
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
              disabled={loading || hasEmailError}
              onPress={() => resendVerificationWithEmail()}
              style={styles.button}
            >
              Resend
            </Button>
          </View>
        </View>

        <View>
          <View style={styles.secondary}>
            <Text>Already have an account?</Text>
            <Button
              mode="text"
              disabled={loading}
              onPress={() => router.push("/(auth)/signin")}
            >
              Sign in
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
