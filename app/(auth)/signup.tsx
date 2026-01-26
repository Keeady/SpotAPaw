import { log } from "@/components/logs";
import PhoneNumberInput from "@/components/phone-number-util";
import { supabase } from "@/components/supabase-client";
import { useRouter } from "expo-router";
import { CountryCode, isValidPhoneNumber } from "libphonenumber-js";
import React, { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { showMessage } from "react-native-flash-message";
import { Button, Text, TextInput, useTheme } from "react-native-paper";
import isEmail from "validator/es/lib/isEmail";

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
  const [hasPhoneError, setHasPhoneError] = useState(false);
  const [hasEmailError, setHasEmailError] = useState(false);

  const debounceTimer = useRef<number>(null);

  const [selectedCountryCode, setSelectedCountryCode] =
    useState<CountryCode>("US");

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

    if (phone && !isValidPhoneNumber(phone, selectedCountryCode)) {
      setHasPhoneError(true);
      return;
    }

    if (!email || !isEmail(email)) {
      setHasEmailError(true);
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
      log(error.message);
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

  const handlePhoneNumberChange = (
    phone: string,
    countryCode: CountryCode,
    isValid: boolean,
  ) => {
    setSelectedCountryCode(countryCode);
    setPhone(phone);
    setHasPhoneError(!isValid);
  };

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
          <Text variant="labelSmall"> </Text>
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
          <Text variant="labelSmall"> </Text>
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
          <PhoneNumberInput
            onPhoneNumberChange={handlePhoneNumberChange}
            showInvalidPhoneError={hasPhoneError}
          />
        </View>
        <View style={[styles.verticallySpaced]}>
          <Text variant="labelSmall" style={{ color: theme.colors.error }}>
            {hasEmailError ? "Invalid email address." : ""}
          </Text>
          <TextInput
            label="Email (Required)"
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
            label="Password (Required)"
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
            disabled={loading || hasEmailError || hasPhoneError}
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
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  countryButton: {
    marginRight: 8,
    marginTop: 4,
  },
  countryButtonContent: {
    height: 56,
  },
  menuScroll: {
    maxHeight: 300,
  },
  phoneInput: {
    flex: 1,
  },
});
