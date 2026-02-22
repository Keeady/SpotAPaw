import DividerWithText from "@/components/divider-with-text";
import { log } from "@/components/logs";
import { supabase } from "@/components/supabase-client";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
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

export default function SignUpScreen() {
  const theme = useTheme();
  const [behavior, setBehavior] = useState<"padding" | undefined>("padding");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [isHidden, setHidden] = useState(true);
  const [extra_info, setExtraInfo] = useState("");
  const [hasEmailError, setHasEmailError] = useState(false);

  const debounceTimer = useRef<number>(null);

  const validate = useCallback((password: string): boolean => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    return passwordRegex.test(password);
  }, []);

  async function signUpWithEmail() {
    if (extra_info.trim()) {
      return;
    }

    if (!email || !password) {
      showMessage({
        message: "Email and password are required. Please try again.",
        type: "warning",
        icon: "warning",
        autoHide: true,
        statusBarHeight: 50,
      });
      return;
    }

    if (password !== rePassword) {
      showMessage({
        message: "Passwords do not match. Please try again.",
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

    const isValid = validate(password);
    if (!isValid) {
      showMessage({
        message: "Please use a strong password.",
        type: "warning",
        icon: "warning",
        autoHide: true,
        statusBarHeight: 50,
      });
      return;
    }

    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        emailRedirectTo: "spotapaw://auth/verify",
      },
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
    }
    if (!session) {
      showMessage({
        message: "Please check your inbox for email verification!",
        type: "success",
        icon: "success",
        autoHide: true,
        statusBarHeight: 50,
      });
    }

    setLoading(false);
    router.navigate("/");
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
          <View style={styles.verticallySpaced}>
            <TextInput
              label="Password"
              left={<TextInput.Icon icon="lock" />}
              onChangeText={(text) => setPassword(text)}
              value={password}
              secureTextEntry={isHidden}
              placeholder="Password"
              autoCapitalize={"none"}
              right={
                <TextInput.Icon
                  icon={isHidden ? "eye" : "eye-off"}
                  onPress={() => setHidden(!isHidden)}
                />
              }
              mode="outlined"
              textContentType="password"
            />
          </View>
          <View style={styles.verticallySpaced}>
            <TextInput
              label="Confirm Password"
              left={<TextInput.Icon icon="lock" />}
              onChangeText={(text) => setRePassword(text)}
              value={rePassword}
              secureTextEntry={isHidden}
              placeholder="Confirm Password"
              autoCapitalize={"none"}
              mode="outlined"
              textContentType="password"
            />
            <HelperText visible={true} type="info" padding="none">
              Password must be at least 8 characters long, include one uppercase
              letter, one lowercase letter, one number, and one special
              character.
            </HelperText>
          </View>
          <View style={[styles.verticallySpaced]}>
            <Button
              mode="contained"
              disabled={loading || hasEmailError}
              onPress={() => signUpWithEmail()}
              style={styles.button}
            >
              Create an account
            </Button>
          </View>

          <DividerWithText text="OR" />

          <View style={[styles.verticallySpaced, styles.mt20]}>
            <Button
              icon="google"
              mode="outlined"
              onPress={() => router.push("/(auth)/oauth")}
              style={styles.button}
            >
              Continue with Google
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
