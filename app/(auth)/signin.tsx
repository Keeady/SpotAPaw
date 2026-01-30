import { log } from "@/components/logs";
import { supabase } from "@/components/supabase-client";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { showMessage } from "react-native-flash-message";
import { Button, Text, TextInput, useTheme } from "react-native-paper";
import isEmail from "validator/es/lib/isEmail";

export default function SignInScreen() {
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [isHidden, setHidden] = useState(true);
  const [extra_info, setExtraInfo] = useState("");

  const [hasEmailError, setHasEmailError] = useState(false);

  const debounceTimer = useRef<number>(null);

  async function signInWithEmail() {
    if (extra_info.trim()) {
      return;
    }

    if (!email || !password) {
      showMessage({
        message: "Email and password are required. Please try again.",
        type: "warning",
        icon: "warning",
        autoHide: true,
        statusBarHeight: 100,
      });
      return;
    }

    if (!email || !isEmail(email)) {
      setHasEmailError(true);
      return;
    }

    setLoading(true);
    const {
      error,
      data: { session },
    } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (session) {
      router.dismissTo("/(app)/my-sightings");
      return;
    }

    if (error) {
      log(error.message);
      showMessage({
        message: "Invalid email or password. Please try again.",
        type: "danger",
        icon: "danger",
        autoHide: true,
        statusBarHeight: 100,
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
          Find and protect your furry friend
        </Text>
      </View>
      <View style={styles.content}>
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
        <View style={styles.verticallySpaced}>
          <TextInput
            label="Password"
            left={<TextInput.Icon icon="lock" />}
            onChangeText={(text) => setPassword(text)}
            value={password}
            secureTextEntry={isHidden}
            placeholder="Password"
            autoCapitalize={"none"}
            mode="outlined"
            right={
              <TextInput.Icon
                icon={isHidden ? "eye" : "eye-off"}
                onPress={() => setHidden(!isHidden)}
              />
            }
            textContentType="password"
          />
        </View>
        <View style={[styles.verticallySpaced, styles.mt20]}>
          <Button
            mode="contained"
            disabled={loading || !email || !password || hasEmailError}
            onPress={() => signInWithEmail()}
          >
            Sign in
          </Button>
        </View>
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
  },
  secondary: {
    flexDirection: "row",
    alignItems: "baseline",
    paddingTop: 4,
    paddingBottom: 4,
  },
  content: {
    paddingHorizontal: 24,
    alignItems: "center",
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
});
