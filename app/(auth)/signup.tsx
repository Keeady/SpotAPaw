import { supabase } from "@/components/supabase-client";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { showMessage } from "react-native-flash-message";
import { Button, Text, TextInput, useTheme } from "react-native-paper";

export default function SignUpScreen() {
  const theme = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
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
        data: {
          firstName,
          lastName,
          phone,
        },
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={"padding"}
      keyboardVerticalOffset={100}
    >
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.headerTitle}>Welcome!</Text>
        <Text style={styles.headerSubtitle}>
          Join a community of pets and pet lovers
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.verticallySpaced, styles.mt20]}>
          <TextInput
            label="First Name"
            left={<TextInput.Icon icon="account" />}
            onChangeText={(text) => setFirstName(text)}
            value={firstName}
            placeholder="First Name"
            autoCapitalize={"none"}
            mode="outlined"
          />
        </View>
        <View style={[styles.verticallySpaced]}>
          <TextInput
            label="Last Name"
            left={<TextInput.Icon icon="account" />}
            onChangeText={(text) => setLastName(text)}
            value={lastName}
            placeholder="Last Name"
            autoCapitalize={"none"}
            mode="outlined"
          />
        </View>
        <View style={[styles.verticallySpaced]}>
          <TextInput
            label="Phone Number"
            left={<TextInput.Icon icon="phone" />}
            onChangeText={(text) => setPhone(text)}
            value={phone}
            placeholder="Phone Number"
            autoCapitalize={"none"}
            mode="outlined"
          />
        </View>
        <View style={[styles.verticallySpaced]}>
          <TextInput
            label="Email*"
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
            label="Password*"
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
    flexDirection: "row",
    alignItems: "baseline",
    paddingTop: 4,
    paddingBottom: 4,
  },
  content: {
    paddingHorizontal: 16,
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
