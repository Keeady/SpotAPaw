import { AuthHandler } from "@/auth/auth";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
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

export default function ResetPasswordScreen() {
  const theme = useTheme();
  const [behavior, setBehavior] = useState<"padding" | undefined>("padding");

  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [isHidden, setHidden] = useState(true);
  const [extra_info, setExtraInfo] = useState("");
  const [disabled, setDisabled] = useState(false);

  const validate = useCallback((password: string): boolean => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    return passwordRegex.test(password);
  }, []);

  async function resetPassword() {
    if (extra_info.trim()) {
      return;
    }

    if (!password) {
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
    const authHandler = new AuthHandler();
    authHandler
      .updatePassword(password)
      .then(() => {
        showMessage({
          message: "Successfully reset your password!",
          type: "success",
          icon: "success",
          autoHide: true,
          statusBarHeight: 50,
        });
      })
      .catch(() => {
        showMessage({
          message: "An error occured. Please try again.",
          type: "danger",
          icon: "danger",
          autoHide: true,
          statusBarHeight: 50,
        });
      })
      .finally(() => {
        setLoading(false);
        setDisabled(true);

        router.navigate("/(auth)/signin");
      });
  }

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
              disabled={loading || disabled}
              onPress={() => resetPassword()}
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
