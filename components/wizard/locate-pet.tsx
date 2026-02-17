import { StyleSheet, View } from "react-native";
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
    <View>
      <WizardHeader
        title="Where was the pet last seen?"
        subTitle="Place a pin on map to share pet's last location."
      />
      <View style={styles.content}>
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
    // paddingHorizontal: 24,
    alignItems: "center",
  },
  helperText: {
    alignSelf: "flex-end",
    paddingRight: 10,
  },
});
