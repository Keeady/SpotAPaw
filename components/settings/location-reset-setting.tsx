import { Button, List } from "react-native-paper";
import {
  LocationConfirmationDialog,
  LocationResetSuccessDialog,
} from "../location-request-util";

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
  return (
    <>
      <List.Item
        title="Reset Saved Location"
        description="Remove your manually selected location"
        left={(props) => (
          <List.Icon
            {...props}
            icon="map-marker-remove"
            color={iconColorLocationRemove}
          />
        )}
        right={() => (
          <Button mode="outlined" compact onPress={() => setResetLocationDialogVisible(true)} testID="reset-button">
            Reset
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
