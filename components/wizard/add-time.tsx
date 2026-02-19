import { StyleSheet, View, Platform, ScrollView } from "react-native";
import { Text, HelperText, TextInput } from "react-native-paper";
import { useEffect, useState } from "react";
import { SightingWizardStepData } from "./wizard-form";
import { WizardHeader } from "./wizard-header";
import DatePicker from "../date-picker";

export function AddTime({
  updateSightingData,
  sightingFormData,
  isValidData,
}: SightingWizardStepData) {
  const [hasErrors, setHasErrors] = useState(false);

  useEffect(() => {
    if (!isValidData) {
      setHasErrors(true);
    } else {
      setHasErrors(false);
    }
  }, [isValidData]);

  const { note, last_seen_time } = sightingFormData;

  return (
    <View style={{ flex: 1 }}>
      <WizardHeader
        title="When was the pet last seen?"
        subTitle="Select a date and time"
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
            Please select a valid date and time!
          </HelperText>
          <Text
            variant="bodyLarge"
            style={{
              alignSelf: "flex-start",
              fontWeight: "bold",
              marginBottom: 10,
            }}
          >
            Select a date and time:
          </Text>
          <DatePicker
            dateLabel="Last Seen Date"
            timeLabel="Last Seen Time"
            value={last_seen_time ? new Date(last_seen_time) : new Date()}
            onChange={(v) =>
              updateSightingData("last_seen_time", v.toISOString())
            }
          />
        </View>
        <View style={[styles.verticallySpaced, styles.mt20]}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text variant="titleMedium">Additional details:</Text>
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
    fontWeight: "bold"
  },
});
