import { ScrollView, StyleSheet, View } from "react-native";
import { useEffect, useState } from "react";
import { SightingWizardStepData } from "./wizard-form";
import { WizardHeader } from "./wizard-header";
import { usePermission } from "../Provider/permission-provider";
import DropPinOnMap from "../map-util";
import { HelperText } from "react-native-paper";

export function LocatePet({
  updateSightingData,
  sightingFormData,
  isValidData,
}: SightingWizardStepData) {
  const { location } = usePermission();
  const [hasErrors, setHasErrors] = useState(false);

  useEffect(() => {
    if (!isValidData) {
      setHasErrors(true);
    } else {
      setHasErrors(false);
    }
  }, [isValidData]);

  const { last_seen_lat, last_seen_long } = sightingFormData;
  return (
    <View style={{ flex: 1 }}>
      <WizardHeader
        title="Where was the pet last seen?"
        subTitle="Place a pin on map to share pet's last location."
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <HelperText
          type="error"
          visible={hasErrors && !last_seen_lat && !last_seen_long}
          style={styles.helperText}
          padding="none"
        >
          Please select a location!
        </HelperText>

        <DropPinOnMap
          currentLocation={location}
          pins={
            last_seen_lat && last_seen_long
              ? [
                  {
                    latitude: last_seen_lat,
                    longitude: last_seen_long,
                    title: "pet's last seen location",
                  },
                ]
              : []
          }
          handleActionButton={(location) => {
            if (location) {
              updateSightingData("last_seen_long", location?.lng);
              updateSightingData("last_seen_lat", location?.lat);
              updateSightingData("last_seen_location", "");
            }
          }}
        />
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
    paddingHorizontal: 16,
    alignItems: "center",
  },
  helperText: {
    alignSelf: "flex-end",
    paddingRight: 10,
    fontWeight: "bold",
  },
});
