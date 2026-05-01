import { Button, List } from "react-native-paper";
import {
  LocationConfirmationDialog,
  LocationResetSuccessDialog,
} from "../location-request-util";
import { useTranslation } from "react-i18next";

const LocationResetSetting = ({
  iconColorLocationRemove,
  setResetLocationDialogVisible,
  resetLocationDialogVisible,
  locationResetSuccessDialogVisible,
  setLocationResetSuccessDialogVisible,
  handleResetSavedLocation,
}: {
  iconColorLocationRemove: string;
  setResetLocationDialogVisible: (visible: boolean) => void;
  resetLocationDialogVisible: boolean;
  locationResetSuccessDialogVisible: boolean;
  setLocationResetSuccessDialogVisible: (visible: boolean) => void;
  handleResetSavedLocation: () => void;
}) => {
  const { t } = useTranslation(["settings", "translation"]);
  return (
    <>
      <List.Item
        title={t("resetSavedLocation")}
        description={t("removeYourManuallySelectedLocation")}
        left={(props) => (
          <List.Icon
            {...props}
            icon="map-marker-remove"
            color={iconColorLocationRemove}
          />
        )}
        right={() => (
          <Button
            mode="outlined"
            compact
            onPress={() => setResetLocationDialogVisible(true)}
            testID="reset-button"
          >
            {t("reset")}
          </Button>
        )}
      />

      {/* Reset Location Confirmation Dialog */}
      <LocationConfirmationDialog
        resetLocationDialogVisible={resetLocationDialogVisible}
        setResetLocationDialogVisible={setResetLocationDialogVisible}
        handleResetSavedLocation={handleResetSavedLocation}
      />

      {/* Location Reset Success Dialog */}
      <LocationResetSuccessDialog
        locationResetSuccessDialogVisible={locationResetSuccessDialogVisible}
        setLocationResetSuccessDialogVisible={
          setLocationResetSuccessDialogVisible
        }
      />
    </>
  );
};

export default LocationResetSetting;
