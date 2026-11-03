import { ScrollView, StyleSheet, View } from "react-native";
import { Text, HelperText, TextInput } from "react-native-paper";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import DatePicker from "../../date-picker";
import DropPinOnMap from "../../map-util";
import { usePermission } from "../../Provider/permission-provider";
import type { WizardScreenProps } from "../wizard-types";

export function LastSeenStep({
  formData,
  loading,
  updateFormData,
  onComplete,
  registerSubmit,
}: WizardScreenProps) {
  const { t } = useTranslation("wizard");
  const { location } = usePermission();
  const [hasErrors, setHasErrors] = useState(false);

  const { note, lastSeenTime, lastSeenLat, lastSeenLong } = formData;

  // The picker shows "now" when there is no value; store it so what the user
  // sees is what gets submitted even if they never touch the picker.
  useEffect(() => {
    if (!lastSeenTime) {
      updateFormData({ lastSeenTime: new Date().toISOString() });
    }
    // Only on mount: later edits come from the picker.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const errors = {
    time: !lastSeenTime || Number.isNaN(new Date(lastSeenTime).getTime()),
    location: lastSeenLat == null || lastSeenLong == null,
  };
  const isValid = !errors.time && !errors.location;

  // This screen's own onComplete: validate, then hand off to the base one.
  const handleComplete = useCallback(async () => {
    if (!isValid) {
      setHasErrors(true);
      return;
    }
    setHasErrors(false);
    await onComplete();
  }, [isValid, onComplete]);

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
      {/* When */}
      <View style={[styles.verticallySpaced, styles.mt10]}>
        <HelperText
          type="error"
          visible={hasErrors && errors.time}
          style={styles.helperText}
          padding="none"
        >
          {t("pleaseSelectAValidDateAndTime", "Please select a valid date and time!")}
        </HelperText>
        <Text variant="bodyLarge" style={styles.sectionLabel}>
          {t("selectADateAndTime", "Select a date and time:")}
        </Text>
        <DatePicker
          dateLabel="Last Seen Date"
          timeLabel="Last Seen Time"
          value={lastSeenTime ? new Date(lastSeenTime) : new Date()}
          onChange={(v) => updateFormData({ lastSeenTime: v.toISOString() })}
        />
      </View>

      {/* Where */}
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <HelperText
          type="error"
          visible={hasErrors && errors.location}
          style={styles.helperText}
          padding="none"
        >
          {t("pleaseSelectALocation", "Please select a location!")}
        </HelperText>
        <Text variant="bodyLarge" style={styles.sectionLabel}>
          {t(
            "placeAPinOnMapToSharePetsLastLocation",
            "Place a pin on map to share pet's last location.",
          )}
        </Text>
        <DropPinOnMap
          currentLocation={location}
          pins={
            lastSeenLat != null && lastSeenLong != null
              ? [
                  {
                    latitude: lastSeenLat,
                    longitude: lastSeenLong,
                    title: t("petsLastSeenLocation", "pet's last seen location"),
                  },
                ]
              : []
          }
          handleActionButton={(loc) => {
            if (loc) {
              updateFormData({
                lastSeenLong: loc.lng,
                lastSeenLat: loc.lat,
                lastSeenLocation: "",
              });
            }
          }}
        />
      </View>

      {/* Extra details */}
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Text variant="titleMedium">
          {t("additionalDetails", "Additional details:")}
        </Text>
        <TextInput
          value={note}
          onChangeText={(value) => updateFormData({ note: value })}
          mode="outlined"
          multiline
          numberOfLines={4}
          disabled={loading}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  verticallySpaced: { alignSelf: "stretch" },
  mt20: { marginTop: 20 },
  mt10: { marginTop: 10 },
  content: { paddingHorizontal: 12, alignItems: "center", paddingBottom: 24 },
  sectionLabel: { alignSelf: "flex-start", fontWeight: "bold", marginBottom: 10 },
  helperText: { alignSelf: "flex-end", fontWeight: "bold" },
});
