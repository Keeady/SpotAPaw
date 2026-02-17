import { ScrollView, StyleSheet, View } from "react-native";
import { Text, TextInput, HelperText } from "react-native-paper";
import { useCallback, useContext, useEffect } from "react";
import { SightingWizardStepData } from "./wizard-form";
import { WizardHeader } from "./wizard-header";
import PhoneNumberInput from "../phone-number-util";
import { CountryCode } from "libphonenumber-js";
import { AuthContext } from "../Provider/auth-provider";
import { supabase } from "../supabase-client";

export function AddContact({
  updateSightingData,
  sightingFormData,
  reportType,
}: SightingWizardStepData) {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user?.user_metadata) {
      if (user.user_metadata["firstName"]) {
        updateSightingData("contactName", user.user_metadata["firstName"]);
      }

      if (user.user_metadata["phone"]) {
        updateSightingData("contactPhone", user.user_metadata["phone"]);
      }

      if (user.user_metadata["countryCode"]) {
        updateSightingData(
          "contactPhoneCountryCode",
          user.user_metadata["countryCode"],
        );
      }
    }
  }, [user?.user_metadata, updateSightingData]);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    supabase
      .from("owner")
      .select("*")
      .eq("owner_id", user.id)
      .then(({ data }) => {
        if (data && data.length > 0) {
          updateSightingData("contactName", data[0].firstname);
          updateSightingData("contactPhone", data[0].phone);
          updateSightingData("contactPhoneCountryCode", data[0].country_code);
        }
      });
  }, [user?.id, updateSightingData]);

  const handlePhoneNumberChange = useCallback(
    (phone: string, countryCode: CountryCode) => {
      updateSightingData("contactPhoneCountryCode", countryCode);
      updateSightingData("contactPhone", phone);
    },
    [updateSightingData],
  );

  const { contactPhone, contactPhoneCountryCode, contactName } =
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
            onChangeText={(text) => updateSightingData("contactName", text)}
            value={contactName}
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
            phone={contactPhone}
            phoneCountryCode={contactPhoneCountryCode as CountryCode}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
    alignItems: "center",
  },
  stepContent: {
    // flex: 1,
    // marginBottom: 16,
  },
  verticallySpaced: {
    alignSelf: "stretch",
    // backgroundColor: "blue"
  },
  mt20: {
    marginTop: 20,
  },
  mt10: {
    marginTop: 10,
  },
  mb10: {
    marginBottom: 10,
  },
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    minHeight: "100%",
    paddingBottom: 40,
  },
  title: {
    marginBottom: 20,
  },
  preview: {
    width: "100%",
    height: 300,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    marginTop: 5,
  },
  emptyPreview: {
    width: "100%",
    height: 300,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ddd",
    marginTop: 5,
  },
  radioGroupRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  radioGroupCol: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 8,
  },
  radioItem: {
    flexDirection: "row",
    alignItems: "center",
    // justifyContent: "flex-start"
  },
  helperText: {
    alignSelf: "flex-end",
  },
});
