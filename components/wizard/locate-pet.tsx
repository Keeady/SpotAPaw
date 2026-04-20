import { ScrollView, StyleSheet, View } from "react-native";
import { useEffect, useState } from "react";
import { WizardHeader } from "./wizard-header";
import { usePermission } from "../Provider/permission-provider";
import DropPinOnMap from "../map-util";
import { HelperText } from "react-native-paper";
import { SightingWizardStepData } from "./wizard-interface";

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

  const { lastSeenLat, lastSeenLong } = sightingFormData;
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
          visible={hasErrors && !lastSeenLat && !lastSeenLong}
          style={styles.helperText}
          padding="none"
        >
          Please select a location!
        </HelperText>

        <DropPinOnMap
          currentLocation={location}
          pins={
            lastSeenLat && lastSeenLong
              ? [
                  {
                    latitude: lastSeenLat,
                    longitude: lastSeenLong,
                    title: "pet's last seen location",
                  },
                ]
              : []
          }
          handleActionButton={(location) => {
            if (location) {
              updateSightingData("lastSeenLong", location?.lng);
              updateSightingData("lastSeenLat", location?.lat);
              updateSightingData("lastSeenLocation", "");
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
