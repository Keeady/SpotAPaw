import { supabase } from "@/components/supabase-client";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { showMessage } from "react-native-flash-message";
import { Button, Text, TextInput } from "react-native-paper";

export default function SignUpScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [isHidden, setHidden] = useState(true);
  const [extra_info, setExtraInfo] = useState("");

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
        statusBarHeight: 100,
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
      showMessage({
        message: "An error occured. Please try again.",
        type: "danger",
        icon: "danger",
        autoHide: true,
        statusBarHeight: 100,
      });
    }
    if (!session) {
      showMessage({
        message: "Please check your inbox for email verification!",
        type: "success",
        icon: "success",
        autoHide: true,
        statusBarHeight: 100,
      });
    }

    setLoading(false);
    router.navigate("/");
  }

  return (
    <View style={styles.container}>
      <Text variant="titleLarge">Welcome!</Text>
      <Text variant="titleMedium">Find and protect your furry friend</Text>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <TextInput
          label="Email"
          left={<TextInput.Icon icon="mail" />}
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          autoCapitalize={"none"}
          mode="outlined"
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
        <Button
          mode="contained"
          disabled={loading}
          onPress={() => signUpWithEmail()}
        >
          Sign up
        </Button>
      </View>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 24,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  logo: {
    width: "100%",
    //height: 100,
    marginBottom: 40,
    marginTop: 40,
    resizeMode: "contain",
  },
  button: {
    width: "100%",
    marginBottom: 16,
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
    flex: 1,
    flexDirection: "row",
    alignItems: "baseline",
    paddingTop: 4,
    paddingBottom: 4,
  },
});
