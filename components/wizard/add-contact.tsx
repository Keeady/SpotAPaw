import { ScrollView, StyleSheet, View } from "react-native";
import { Text, TextInput, HelperText } from "react-native-paper";
import { useCallback, useContext, useEffect, useRef } from "react";
import { SightingWizardStepData } from "./wizard-form";
import { WizardHeader } from "./wizard-header";
import PhoneNumberInput from "../phone-number-util";
import { CountryCode } from "libphonenumber-js";
import { AuthContext } from "../Provider/auth-provider";
import { OwnerRepository } from "@/db/repositories/owner-repository";
import { showMessage } from "react-native-flash-message";

export function AddContact({
  updateSightingData,
  sightingFormData,
  reportType,
}: SightingWizardStepData) {
  const { user } = useContext(AuthContext);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    updateSightingData("reporterId", user.id);
    const repository = new OwnerRepository();
    repository
      .getOwner(user.id)
      .then((data) => {
        if (!isMountedRef.current) {
          return;
        }
        if (data) {
          updateSightingData("reporterName", data.firstName);
          updateSightingData("reporterPhone", data.phone);
          updateSightingData("contactPhoneCountryCode", data.countryCode);
        }
      })
      .catch(() => {
        showMessage({
          message: "Error fetching contact info.",
          type: "warning",
          icon: "warning",
          statusBarHeight: 50,
        });
      });
  }, [user?.id, updateSightingData]);

  const handlePhoneNumberChange = useCallback(
    (phone: string, countryCode: CountryCode) => {
      updateSightingData("contactPhoneCountryCode", countryCode);
      updateSightingData("reporterPhone", phone);
    },
    [updateSightingData],
  );

  const { reporterPhone, contactPhoneCountryCode, reporterName } =
    sightingFormData;

  return (
    <View style={{ flex: 1 }}>
      <WizardHeader
        title="Update your contact info."
        subTitle="Review and edit your contact Info"
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {reportType === "found_stray" && (
          <Text variant="titleSmall" style={styles.title}>
            Would you like to be contacted by pet owner about this sighting?
          </Text>
        )}

        {reportType === "lost_own" && (
          <Text variant="titleSmall" style={styles.title}>
            Let us know how to reach you about your pet.
          </Text>
        )}

        <View style={[styles.verticallySpaced, styles.mt10]}>
          <Text variant="titleMedium">Contact Name:</Text>
          <TextInput
            left={<TextInput.Icon icon="account" />}
            onChangeText={(text) => updateSightingData("reporterName", text)}
            value={reporterName}
            placeholder="First & Last Name"
            autoCapitalize={"none"}
            mode="outlined"
            textContentType="name"
            style={styles.mt20}
          />
        </View>

        <View style={[styles.verticallySpaced, styles.mt20]}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text variant="titleMedium">Contact Number:</Text>
            <HelperText
              type="error"
              visible={false}
              style={styles.helperText}
              padding="none"
            >
              Please enter a valid phone number!
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
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 12,
    alignItems: "center",
  },
  verticallySpaced: {
    alignSelf: "stretch",
  },
  mt20: {
    marginTop: 20,
  },
  mt10: {
    marginTop: 10,
  },
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    minHeight: "100%",
    paddingBottom: 40,
  },
  title: {
    marginBottom: 20,
    marginTop: 10,
  },
  helperText: {
    alignSelf: "flex-end",
  },
});
