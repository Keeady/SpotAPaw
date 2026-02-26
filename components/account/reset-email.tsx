import { log } from "@/components/logs";
import { supabase } from "@/components/supabase-client";
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
  HelperText,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import isEmail from "validator/es/lib/isEmail";

export default function ResetPasswordForEmailScreen() {
  const theme = useTheme();
  const [behavior, setBehavior] = useState<"padding" | undefined>("padding");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [extra_info, setExtraInfo] = useState("");
  const [hasEmailError, setHasEmailError] = useState(false);

  const debounceTimer = useRef<number>(null);

  async function signUpWithEmail() {
    if (extra_info.trim()) {
      return;
    }

    if (!email) {
      showMessage({
        message: "Email and password are required. Please try again.",
        type: "warning",
        icon: "warning",
        autoHide: true,
        statusBarHeight: 50,
      });
      return;
    }

    if (!email || !isEmail(email)) {
      setHasEmailError(true);
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "spotapaw://auth/reset",
    });

    if (error) {
      log(error.message);
      showMessage({
        message: "An error occured. Please try again.",
        type: "danger",
        icon: "danger",
        autoHide: true,
        statusBarHeight: 50,
      });
    } else {
      showMessage({
        message: "Please check your inbox for password link.",
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
      if (email) {
        setHasEmailError(!isEmail(email));
      } else {
        setHasEmailError(false);
      }
    }, 500);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [email]);

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
        <View style={styles.buttonContainer}>
          <View style={[styles.verticallySpaced]}>
            <HelperText
              type="error"
              visible={hasEmailError}
              style={{ color: theme.colors.error }}
              padding="none"
            >
              Invalid email address.
            </HelperText>
            <TextInput
              label="Email"
              left={<TextInput.Icon icon="mail" />}
              onChangeText={(text) => {
                setEmail(text);
              }}
              value={email}
              placeholder="email@address.com"
              autoCapitalize={"none"}
              mode="outlined"
              keyboardType="email-address"
              error={hasEmailError}
            />
          </View>

          <View style={[styles.verticallySpaced]}>
            <Button
              mode="contained"
              disabled={loading || hasEmailError}
              onPress={() => signUpWithEmail()}
              style={styles.button}
            >
              Reset your password
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
