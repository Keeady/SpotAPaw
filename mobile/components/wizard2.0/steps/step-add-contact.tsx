import { ScrollView, StyleSheet, View } from "react-native";
import { Text, TextInput, HelperText } from "react-native-paper";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { CountryCode, isValidPhoneNumber } from "libphonenumber-js";
import { showMessage } from "react-native-flash-message";
import PhoneNumberInput from "../../phone-number-util";
import { AuthContext } from "../../Provider/auth-provider";
import { OwnerRepository } from "@/db/repositories/owner-repository";
import { log } from "../../logs";
import { createErrorLogMessage } from "../../util";
import type { WizardScreenProps } from "../wizard-types";

export function AddContactStep({
  formData,
  updateFormData,
  onComplete,
  registerSubmit,
}: WizardScreenProps) {
  const { t } = useTranslation("wizard");
  const { user } = useContext(AuthContext);
  const [hasErrors, setHasErrors] = useState(false);
  const isMountedRef = useRef(true);

  const { reporterPhone, contactPhoneCountryCode, reporterName, reportType } = formData;

  // Always points at the latest form data, so the async owner lookup below
  // can avoid overwriting something the user already typed.
  const formDataRef = useRef(formData);
  formDataRef.current = formData;

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Pre-fill from the signed-in user's owner profile.
  useEffect(() => {
    if (!user?.id) return;

    updateFormData({ reporterId: user.id });
    new OwnerRepository()
      .getOwner(user.id)
      .then((data) => {
        if (!isMountedRef.current || !data) return;
        const current = formDataRef.current;
        updateFormData({
          reporterName: current.reporterName || data.firstName,
          reporterPhone: current.reporterPhone || data.phone,
          contactPhoneCountryCode: current.contactPhoneCountryCode || data.countryCode,
        });
      })
      .catch((error) => {
        log(`Failed to fetch owner info for user: ${createErrorLogMessage(error)}`);
        showMessage({
          message: t("errorFetchingContactInfo", "Error fetching contact info."),
          type: "warning",
          icon: "warning",
          statusBarHeight: 50,
        });
      });
  }, [user?.id, updateFormData, t]);

  const handlePhoneNumberChange = useCallback(
    (phone: string, countryCode: CountryCode) => {
      updateFormData({ contactPhoneCountryCode: countryCode, reporterPhone: phone });
    },
    [updateFormData],
  );

  // Contact info is optional, but a number that is entered must be valid.
  const phoneInvalid =
    !!reporterPhone &&
    !isValidPhoneNumber(reporterPhone, contactPhoneCountryCode as CountryCode);

  // This screen's own onComplete: validate, then hand off to the base one.
  const handleComplete = useCallback(async () => {
    if (phoneInvalid) {
      setHasErrors(true);
      return;
    }
    setHasErrors(false);
    await onComplete();
  }, [phoneInvalid, onComplete]);

  useEffect(() => {
    registerSubmit(handleComplete);
    return () => registerSubmit(null);
  }, [handleComplete, registerSubmit]);

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {reportType === "found_stray" && (
        <Text variant="titleSmall" style={styles.title}>
          {t(
            "wouldYouLikeToBeContactedByPetOwnerAboutThisSighting",
            "Would you like to be contacted by pet owner about this sighting?",
          )}
        </Text>
      )}

      {reportType === "lost_own" && (
        <Text variant="titleSmall" style={styles.title}>
          {t(
            "letUsKnowHowToReachYouAboutYourPet",
            "Let us know how to reach you about your pet.",
          )}
        </Text>
      )}

      <View style={[styles.verticallySpaced, styles.mt10]}>
        <Text variant="titleMedium">{t("contactName", "Contact Name:")}</Text>
        <TextInput
          left={<TextInput.Icon icon="account" />}
          onChangeText={(text) => updateFormData({ reporterName: text })}
          value={reporterName}
          placeholder={t("firstLastName", "First & Last Name")}
          autoCapitalize="none"
          mode="outlined"
          textContentType="name"
          style={[styles.mt20, {backgroundColor: "#fff"}]}
        />
      </View>

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <View style={styles.row}>
          <Text variant="titleMedium">{t("contactNumber", "Contact Number:")}</Text>
          <HelperText
            type="error"
            visible={hasErrors && phoneInvalid}
            style={styles.helperText}
            padding="none"
          >
            {t("pleaseEnterAValidPhoneNumber", "Please enter a valid phone number!")}
          </HelperText>
        </View>

        <PhoneNumberInput
          onPhoneNumberChange={handlePhoneNumberChange}
          disabled={false}
          phone={reporterPhone}
          phoneCountryCode={contactPhoneCountryCode as CountryCode}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 12, alignItems: "center" },
  verticallySpaced: { alignSelf: "stretch" },
  mt20: { marginTop: 20 },
  mt10: { marginTop: 10 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  title: { marginBottom: 20, marginTop: 10 },
  helperText: { alignSelf: "flex-end" },
});
