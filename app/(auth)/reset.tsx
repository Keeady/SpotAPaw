import { log } from "@/components/logs";
import { supabase } from "@/components/supabase-client";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Platform, View, StyleSheet, ScrollView } from "react-native";
import { showMessage } from "react-native-flash-message";
import { Button, Text, TextInput, useTheme } from "react-native-paper";
import isEmail from "validator/es/lib/isEmail";

export default function Reset() {
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [extra_info, setExtraInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState("");
  const [hasEmailError, setHasEmailError] = useState(false);
  const [showCodeVerification, setShowCodeVerification] = useState(false);
  const router = useRouter();
  const [disable, setDisabled] = useState(false);

  const debounceTimer = useRef<number>(null);

  async function resetWithEmail() {
    if (extra_info.trim()) {
      return;
    }

    if (!email) {
      showMessage({
        message: "Email is required. Please try again.",
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
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      },
    });
    console.log(data, error);

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
        message: "Please check your email for a verification code.",
        type: "success",
        icon: "success",
        autoHide: true,
        statusBarHeight: 50,
      });
      setShowCodeVerification(true);
    }

    setLoading(false);
  }

  async function verify() {
    setLoading(true);
    setDisabled(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });

    if (session) {
      router.dismissTo("/(app)/my-sightings");
      return;
    }

    if (error) {
      log(error.message);
      showMessage({
        message: "Invalid code. Please try again.",
        type: "danger",
        icon: "danger",
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
    }, 1000);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [email]);

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
          <Text variant="titleMedium" style={styles.largeText}>
            Login with a one time passcode.
          </Text>
          {!showCodeVerification && (
            <View>
              <View style={[styles.verticallySpaced, styles.mt20]}>
                <Text variant="labelSmall" style={{ color: "red" }}>
                  {hasEmailError ? "Invalid email address." : ""}
                </Text>
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

              <View style={[styles.verticallySpaced, styles.mt20]}>
                <Button
                  mode="contained"
                  disabled={loading || hasEmailError}
                  onPress={() => resetWithEmail()}
                  style={styles.button}
                >
                  Send code
                </Button>
              </View>
            </View>
          )}

          {showCodeVerification && (
            <View>
              <View style={[styles.verticallySpaced, styles.mt20]}>
                <TextInput
                  label="Verification Code"
                  onChangeText={(text) => {
                    setCode(text);
                  }}
                  value={code}
                  placeholder="Enter verification code sent to your email"
                  autoCapitalize={"none"}
                  mode="outlined"
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.verticallySpaced, styles.mt20]}>
                <Button
                  mode="contained"
                  disabled={loading}
                  onPress={() => verify()}
                  style={styles.button}
                >
                  Verify code
                </Button>
              </View>
            </View>
          )}
        </View>

        <View>
          <View style={styles.secondary}>
            <Text>{"Don't have an account?"}</Text>
            <Button
              mode="text"
              disabled={loading}
              onPress={() => router.push("/(auth)/signup")}
            >
              Register
            </Button>
          </View>
          <TextInput
            style={{ height: 0, opacity: 0 }}
            value={extra_info}
            onChangeText={setExtraInfo}
          />
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
  secondary: {
    flexDirection: "row",
    alignItems: "baseline",
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: "center",
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
  largeText: {
    textAlign: "center",
    paddingTop: 24,
  },
});
