import { log } from "@/components/logs";
import PhoneNumberInput from "@/components/phone-number-util";
import { AuthContext } from "@/components/Provider/auth-provider";
import { createErrorLogMessage, isValidUuid } from "@/components/util";
import { Owner } from "@/db/models/owner";
import { OwnerRepository } from "@/db/repositories/owner-repository";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CountryCode, isValidPhoneNumber } from "libphonenumber-js";
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
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
import { useTranslation } from "react-i18next";

// Design tokens shared with the web PetListRenderer (Tailwind equivalents in comments)
const PRIMARY = "#6750A4"; // bg-[#6750A4]
const PRIMARY_CONTAINER = "#EADDFF";
const PRIMARY_TINT = "#F3EDF7";
const TEXT_MUTED = "#525252"; // text-neutral-600
const BORDER = "#E5E5E5"; // neutral-200
const BORDER_STRONG = "#D4D4D4"; // neutral-300
const RADIUS_CARD = 16; // rounded-2xl
const RADIUS_PILL = 999; // rounded-full
const MAX_WIDTH = 900; // max-w-[900px]

const ProfileScreen = () => {
  const { t } = useTranslation(["owner", "translation"]);
  const router = useRouter();
  const theme = useTheme();

  const [behavior, setBehavior] = useState<"padding" | undefined>("padding");

  const ownerInfo = useRef<Owner>(undefined);
  const [phone, setPhone] = useState("");
  const [phoneCountryCode, setPhoneCountryCode] = useState<CountryCode>();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
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
      (firstName && ownerInfo.current?.firstName !== firstName) ||
      (lastName && ownerInfo.current?.lastName !== lastName) ||
      (phone && ownerInfo.current?.phone !== phone) ||
      (email && ownerInfo.current?.email !== email)
    ) {
      setDisableSubmitBtn(false);
    }
  }, [firstName, lastName, phone, email]);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const repository = new OwnerRepository();
    setLoading(true);
    repository
      .getOwner(user.id)
      .then((data) => {
        if (data) {
          ownerInfo.current = data;
          setFirstName(data.firstName);
          setLastName(data.lastName);
          setPhone(data.phone);
          setId(data.id);
          setEmail(data.email);
          setPhoneCountryCode(data.countryCode as CountryCode);
        }
      })
      .catch((error) => {
        const errorMessage = createErrorLogMessage(error);
        log(`getOwner: Error fetching account info: ${errorMessage}`);
        showMessage({
          message: t(
            "errorFetchingAccountInfo",
            "Error fetching account info.",
          ),
          type: "warning",
          icon: "warning",
          statusBarHeight: 50,
        });
      })
      .finally(() => {
        setLoading(false);
      });
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

    const repository = new OwnerRepository();

    setLoading(true);
    let result;
    try {
      if (id && isValidUuid(id)) {
        await repository.updateOwner(id, {
          firstName,
          lastName,
          phone,
          email,
          countryCode: selectedCountryCode,
        });
      } else {
        result = await repository.createOwner({
          firstName,
          lastName,
          phone,
          email,
          countryCode: selectedCountryCode,
        });
        setId(result);
      }

      setIsEditing(false);
      showMessage({
        message: t(
          "successfullySavedOwnerProfile",
          "Successfully saved owner profile.",
        ),
        type: "success",
        icon: "success",
        statusBarHeight: 50,
      });

      if (sightingId) {
        router.replace(`/my-sightings`);
      }
    } catch (error) {
      const errorMessage = createErrorLogMessage(error);
      log(`createContact: Error saving owner profile: ${errorMessage}`);
      showMessage({
        message: t("errorSavingOwnerProfile", "Error saving owner profile."),
        type: "warning",
        icon: "warning",
        statusBarHeight: 50,
      });
    } finally {
      setLoading(false);
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

  const inputProps = {
    mode: "outlined" as const,
    outlineColor: BORDER_STRONG,
    activeOutlineColor: PRIMARY,
    outlineStyle: styles.inputOutline,
    style: styles.input,
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
            <Avatar.Icon
              size={120}
              icon={"account"}
              color={PRIMARY}
              style={styles.avatar}
            />
            {isEditing && (
              <IconButton
                icon="camera"
                size={24}
                mode="contained"
                containerColor={PRIMARY}
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
              {t("myContactInformation", "My Contact Information")}
            </Text>
            {!isEditing ? (
              <IconButton
                icon="pencil"
                size={20}
                iconColor={PRIMARY}
                onPress={() => setIsEditing(true)}
              />
            ) : null}
          </View>

          <View style={styles.formContainer}>
            <TextInput
              {...inputProps}
              label={t("firstName", "First Name")}
              left={<TextInput.Icon icon="account" />}
              onChangeText={(text) => setFirstName(text)}
              value={firstName}
              placeholder={t("firstName", "First Name")}
              autoCapitalize={"none"}
              disabled={!isEditing}
            />

            <TextInput
              {...inputProps}
              label={t("lastName", "Last Name")}
              left={<TextInput.Icon icon="account" />}
              onChangeText={(text) => setLastName(text)}
              value={lastName}
              placeholder={t("lastName", "Last Name")}
              autoCapitalize={"none"}
              disabled={!isEditing}
            />
            <View>
              <Text variant="labelSmall" style={{ color: theme.colors.error }}>
                {hasEmailError
                  ? t("invalidEmailAddress", "Invalid email address.", { ns: "translation" })
                  : ""}
              </Text>
              <TextInput
                {...inputProps}
                error={hasEmailError}
                label={t("email", "Email", { ns: "translation" })}
                left={<TextInput.Icon icon="email" />}
                onChangeText={(text) => setEmail(text)}
                value={email}
                placeholder="youremail@email.com"
                autoCapitalize={"none"}
                keyboardType="email-address"
                disabled={!isEditing}
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

            {isEditing && (
              <View style={styles.buttonContainer}>
                <Button
                  mode="outlined"
                  onPress={handleCancel}
                  style={[styles.button, styles.cancelButton]}
                  labelStyle={styles.buttonLabel}
                  textColor={PRIMARY}
                >
                  {t("cancel", "Cancel", { ns: "translation" })}
                </Button>
                <Button
                  mode="contained"
                  onPress={() => createContact()}
                  style={styles.button}
                  labelStyle={styles.buttonLabel}
                  buttonColor={PRIMARY}
                  textColor="#fff"
                  disabled={
                    loading ||
                    disableSubmitBtn ||
                    hasPhoneError ||
                    hasEmailError
                  }
                >
                  {t("saveChanges", "Save Changes", { ns: "translation" })}
                </Button>
              </View>
            )}
          </View>

          <Surface style={styles.navigationCard} elevation={0}>
            <TouchableOpacity
              style={styles.navigationItem}
              activeOpacity={0.8}
              onPress={() => router.navigate("/(app)/owner/my-reports")}
            >
              <View style={styles.navigationContent}>
                <View style={styles.iconContainer}>
                  <IconButton
                    icon="file-document-multiple"
                    size={28}
                    iconColor={PRIMARY}
                  />
                </View>
                <View style={styles.navigationText}>
                  <Text variant="titleMedium" style={styles.navigationTitle}>
                    {t("myReports", "My Reports")}
                  </Text>
                  <Text variant="bodySmall" style={styles.navigationSubtitle}>
                    {t(
                      "viewAndManageYourSightingReports",
                      "View and manage your sighting reports",
                    )}
                  </Text>
                </View>
              </View>
              <IconButton
                icon="chevron-right"
                size={24}
                iconColor={TEXT_MUTED}
              />
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
  profileHeader: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 10,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 10,
  },
  avatar: {
    backgroundColor: PRIMARY_CONTAINER,
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
  },
  name: {
    fontWeight: "600",
    marginTop: 8,
  },
  subtitle: {
    color: TEXT_MUTED,
    marginTop: 4,
  },
  content: {
    width: "100%",
    maxWidth: MAX_WIDTH,
    alignSelf: "center",
    paddingHorizontal: 12,
    paddingVertical: 16,
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
    marginBottom: 8,
  },
  input: {
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  inputOutline: {
    borderRadius: RADIUS_CARD,
  },
  phoneContainer: {
    gap: 12,
    marginBottom: 16,
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
    borderRadius: RADIUS_PILL,
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 0,
  },
  cancelButton: {
    borderColor: BORDER_STRONG,
  },
  navigationCard: {
    borderRadius: RADIUS_CARD,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: "#fff",
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
    backgroundColor: PRIMARY_TINT,
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
    color: TEXT_MUTED,
    marginTop: 2,
  },
});

export default ProfileScreen;