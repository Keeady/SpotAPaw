import { StyleSheet, View, Platform } from "react-native";
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
    <View>
      <WizardHeader
        title="When was the pet last seen?"
        subTitle="Select a date and time"
      />
      <View style={styles.content}>
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
      </View>
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
  content: {
    paddingHorizontal: 24,
    alignItems: "center",
  },
  header: {
    backgroundColor: "#714ea9ff",
    padding: 16,
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
  helperText: {
    alignSelf: "flex-end",
  },
});
