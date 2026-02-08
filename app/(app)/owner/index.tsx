import PhoneNumberInput from "@/components/phone-number-util";
import { AuthContext } from "@/components/Provider/auth-provider";
import { supabase } from "@/components/supabase-client";
import { isValidUuid } from "@/components/util";
import { Person } from "@/model/person";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CountryCode, isValidPhoneNumber } from "libphonenumber-js";
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Keyboard,
  KeyboardAvoidingView,
} from "react-native";
import { showMessage } from "react-native-flash-message";
import {
  TextInput,
  Button,
  Surface,
  Text,
  IconButton,
  useTheme,
  Avatar,
} from "react-native-paper";
import isEmail from "validator/es/lib/isEmail";

const ProfileScreen = () => {
  const router = useRouter();
  const theme = useTheme();

  const [behavior, setBehavior] = useState<"padding" | undefined>("padding");

  const ownerInfo = useRef<Person>(undefined);
  const [phone, setPhone] = useState("");
  const [phoneCountryCode, setPhoneCountryCode] = useState<CountryCode>();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [extra_info, setExtraInfo] = useState("");
  const [id, setId] = useState("");
  const [email, setEmail] = useState("");
  const { user } = useContext(AuthContext);

  const [disableSubmitBtn, setDisableSubmitBtn] = useState(true);

  const { sightingId } = useLocalSearchParams<{ sightingId: string }>();

  const [hasPhoneError, setHasPhoneError] = useState(false);
  const [hasEmailError, setHasEmailError] = useState(false);

  const [selectedCountryCode, setSelectedCountryCode] =
    useState<CountryCode>("US");

  const debounceTimer = useRef<number>(null);

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      if (user.user_metadata) {
        if (user.user_metadata["firstName"]) {
          setFirstName(user.user_metadata["firstName"]);
        }

        if (user.user_metadata["lastName"]) {
          setLastName(user.user_metadata["lastName"]);
        }

        if (user.user_metadata["phone"]) {
          setPhone(user.user_metadata["phone"]);
        }
      }
    }
  }, [user]);

  useEffect(() => {
    if (
      (firstName && ownerInfo.current?.firstname !== firstName) ||
      (lastName && ownerInfo.current?.lastname !== lastName) ||
      (address && ownerInfo.current?.address !== address) ||
      (phone && ownerInfo.current?.phone !== phone) ||
      (email && ownerInfo.current?.email !== email)
    ) {
      setDisableSubmitBtn(false);
    }
  }, [firstName, lastName, address, phone, email]);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    setLoading(true);
    supabase
      .from("owner")
      .select("*")
      .eq("owner_id", user.id)
      .then(({ data }) => {
        if (data && data.length > 0) {
          ownerInfo.current = data[0];
          setFirstName(data[0].firstname);
          setLastName(data[0].lastname);
          setPhone(data[0].phone);
          setAddress(data[0].address);
          setId(data[0].id);
          setEmail(data[0].email);
          setPhoneCountryCode(data[0].country_code);
        }
      });
    setLoading(false);
  }, [user?.id]);

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

  async function createContact() {
    if (extra_info.trim() || !user) {
      return;
    }

    if (!isValidPhoneNumber(phone, selectedCountryCode)) {
      setHasPhoneError(true);
      return;
    }

    if (!isEmail(email)) {
      setHasEmailError(true);
      return;
    }

    setLoading(true);
    let result;
    if (id && isValidUuid(id)) {
      result = await supabase
        .from("owner")
        .update([
          {
            firstname: firstName,
            lastname: lastName,
            phone,
            address,
            email,
            id,
            country_code: selectedCountryCode,
          },
        ])
        .eq("id", id)
        .select();
    } else {
      result = await supabase
        .from("owner")
        .insert([
          {
            firstname: firstName,
            lastname: lastName,
            phone,
            address,
            email,
          },
        ])
        .select();
    }

    const { error, data } = result;
    setLoading(false);

    if (error) {
      showMessage({
        message: "Error saving owner profile.",
        type: "warning",
        icon: "warning",
        statusBarHeight: 50,
      });
    } else {
      setIsEditing(false);

      if (data && !id) {
        setId(data[0].id);
      }
      showMessage({
        message: "Successfully saved owner profile.",
        type: "success",
        icon: "success",
        statusBarHeight: 50,
      });

      if (sightingId) {
        router.replace(`/my-sightings`);
      }
    }
  }

  const handlePhoneNumberChange = (
    phone: string,
    countryCode: CountryCode,
    isValid: boolean,
  ) => {
    setSelectedCountryCode(countryCode);
    setPhone(phone);
    setHasPhoneError(!isValid);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={behavior}
      keyboardVerticalOffset={100}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Avatar.Icon size={120} icon={"account"} style={styles.avatar} />
            {isEditing && (
              <IconButton
                icon="camera"
                size={24}
                mode="contained"
                containerColor={theme.colors.primary}
                iconColor="#fff"
                style={styles.cameraButton}
              />
            )}
          </View>

          <Text variant="headlineMedium" style={styles.name}>
            {firstName} {lastName}
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            {email}
          </Text>
        </View>

        <View style={styles.content}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              My Contact Information
            </Text>
            {!isEditing ? (
              <IconButton
                icon="pencil"
                size={20}
                onPress={() => setIsEditing(true)}
              />
            ) : null}
          </View>

          <View style={styles.formContainer}>
            <TextInput
              label="First Name"
              left={<TextInput.Icon icon="account" />}
              onChangeText={(text) => setFirstName(text)}
              value={firstName}
              placeholder="First Name"
              autoCapitalize={"none"}
              mode="outlined"
              disabled={!isEditing}
              style={styles.input}
            />

            <TextInput
              label="Last Name"
              left={<TextInput.Icon icon="account" />}
              onChangeText={(text) => setLastName(text)}
              value={lastName}
              placeholder="Last Name"
              autoCapitalize={"none"}
              mode="outlined"
              disabled={!isEditing}
              // style={styles.input}
            />
            <View>
              <Text variant="labelSmall" style={{ color: theme.colors.error }}>
                {hasEmailError ? "Invalid email address." : ""}
              </Text>
              <TextInput
                error={hasEmailError}
                label="Email"
                left={<TextInput.Icon icon="email" />}
                onChangeText={(text) => setEmail(text)}
                value={email}
                placeholder="youremail@email.com"
                autoCapitalize={"none"}
                mode="outlined"
                keyboardType="email-address"
                disabled={!isEditing}
                // style={styles.input}
              />
            </View>

            <View style={styles.phoneContainer}>
              <PhoneNumberInput
                onPhoneNumberChange={handlePhoneNumberChange}
                showInvalidPhoneError={hasPhoneError}
                disabled={!isEditing}
                phoneCountryCode={phoneCountryCode}
                phone={phone}
              />
            </View>

            <TextInput
              label="Address"
              left={<TextInput.Icon icon="map-marker" />}
              onChangeText={(text) => setAddress(text)}
              value={address}
              placeholder="Street, City"
              autoCapitalize={"none"}
              mode="outlined"
              multiline={true}
              disabled={!isEditing}
              numberOfLines={3}
              style={styles.input}
            />

            {isEditing && (
              <View style={styles.buttonContainer}>
                <Button
                  mode="outlined"
                  onPress={handleCancel}
                  style={[styles.button, styles.cancelButton]}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={() => createContact()}
                  style={styles.button}
                  disabled={
                    loading ||
                    disableSubmitBtn ||
                    hasPhoneError ||
                    hasEmailError
                  }
                >
                  Save Changes
                </Button>
              </View>
            )}
          </View>

          <Surface style={styles.navigationCard} elevation={1}>
            <TouchableOpacity
              style={styles.navigationItem}
              activeOpacity={0.7}
              onPress={() => router.navigate("/(app)/owner/my-reports")}
            >
              <View style={styles.navigationContent}>
                <View style={styles.iconContainer}>
                  <IconButton
                    icon="file-document-multiple"
                    size={28}
                    iconColor={theme.colors.primary}
                  />
                </View>
                <View style={styles.navigationText}>
                  <Text variant="titleMedium" style={styles.navigationTitle}>
                    My Reports
                  </Text>
                  <Text variant="bodySmall" style={styles.navigationSubtitle}>
                    View and manage your sighting reports
                  </Text>
                </View>
              </View>
              <IconButton icon="chevron-right" size={24} />
            </TouchableOpacity>
          </Surface>
          <TextInput
            style={{ height: 0, opacity: 0 }}
            value={extra_info}
            onChangeText={setExtraInfo}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#714ea9ff",
    paddingVertical: 16,
    paddingTop: Platform.OS === "ios" ? 50 : 16,
    alignItems: "center",
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
  profileHeader: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 10,
  },
  avatar: {
    backgroundColor: "#e0e0e0",
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    elevation: 4,
  },
  name: {
    fontWeight: "600",
    marginTop: 8,
  },
  subtitle: {
    color: "#666",
    marginTop: 4,
  },
  content: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontWeight: "600",
  },
  formContainer: {
    borderRadius: 16,
    marginBottom: 8,
  },
  input: {
    marginBottom: 16,
  },
  phoneContainer: {
    gap: 12,
    marginBottom: 16,
  },
  countryCode: {
    flex: 1,
    maxWidth: 110,
  },
  phoneNumber: {
    flex: 2,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
    marginBottom: 10,
    gap: 12,
  },
  button: {
    flex: 1,
  },
  cancelButton: {
    borderColor: "#ddd",
  },
  navigationCard: {
    borderRadius: 16,
    overflow: "hidden",
  },
  navigationItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  navigationContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
  },
  navigationText: {
    marginLeft: 16,
    flex: 1,
  },
  navigationTitle: {
    fontWeight: "600",
  },
  navigationSubtitle: {
    color: "#666",
    marginTop: 2,
  },
});

export default ProfileScreen;
