import { StyleSheet, View, ScrollView } from "react-native";
import { Text, HelperText, TextInput } from "react-native-paper";
import { useEffect, useState } from "react";
import { WizardHeader } from "./wizard-header";
import DatePicker from "../date-picker";
import { SightingWizardStepData } from "./wizard-interface";
import { useTranslation } from "react-i18next";

export function AddTime({
  updateSightingData,
  sightingFormData,
  isValidData,
}: SightingWizardStepData) {
  const { t } = useTranslation("wizard");
  const [hasErrors, setHasErrors] = useState(false);

  useEffect(() => {
    if (!isValidData) {
      setHasErrors(true);
    } else {
      setHasErrors(false);
    }
  }, [isValidData]);

  const { note, lastSeenTime } = sightingFormData;

  return (
    <View style={{ flex: 1 }}>
      <WizardHeader
        title={t("whenWasThePetLastSeen", "When was the pet last seen?")}
        subTitle={t("selectADateAndTime", "Select a date and time")}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.verticallySpaced, styles.mt10]}>
          <HelperText
            type="error"
            visible={hasErrors}
            style={styles.helperText}
            padding="none"
          >
            {t(
              "pleaseSelectAValidDateAndTime",
              "Please select a valid date and time!",
            )}
          </HelperText>
          <Text
            variant="bodyLarge"
            style={{
              alignSelf: "flex-start",
              fontWeight: "bold",
              marginBottom: 10,
            }}
          >
            {t("selectADateAndTime", "Select a date and time:")}
          </Text>
          <DatePicker
            dateLabel="Last Seen Date"
            timeLabel="Last Seen Time"
            value={lastSeenTime ? new Date(lastSeenTime) : new Date()}
            onChange={(v) =>
              updateSightingData("lastSeenTime", v.toISOString())
            }
          />
        </View>
        <View style={[styles.verticallySpaced, styles.mt20]}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text variant="titleMedium">
              {t("additionalDetails", "Additional details:")}
            </Text>
          </View>
          <TextInput
            value={note}
            onChangeText={(value) => updateSightingData("note", value)}
            mode={"outlined"}
            multiline
            numberOfLines={4}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  verticallySpaced: {
    alignSelf: "stretch",
  },
  mt20: {
    marginTop: 20,
  },
  mt10: {
    marginTop: 10,
  },
  content: {
    paddingHorizontal: 12,
    alignItems: "center",
  },
  helperText: {
    alignSelf: "flex-end",
    fontWeight: "bold",
  },
});
