import { Button, List } from "react-native-paper";
import {
  LocationPermissionDeniedDialog,
  LocationPermissionGrantedDialog,
} from "../location-request-util";

const LocationPermissionSetting = ({
  iconColorLocation,
  locationPermissionDescription,
  handleRequestLocationPermission,
  locationPermissionButtonDisabled,
  locationPermissionStatusDisplayText,
  permissionGrantedDialogVisible,
  setPermissionGrantedDialogVisible,
  permissionDeniedDialogVisible,
  setPermissionDeniedDialogVisible,
}: {
  iconColorLocation: string;
  locationPermissionDescription: string;
  handleRequestLocationPermission: () => void;
  locationPermissionButtonDisabled: boolean;
  locationPermissionStatusDisplayText: string;
  permissionGrantedDialogVisible: boolean;
  setPermissionGrantedDialogVisible: (visible: boolean) => void;
  permissionDeniedDialogVisible: boolean;
  setPermissionDeniedDialogVisible: (visible: boolean) => void;
}) => {
  return (
    <>
      <List.Item
        title="Location Permission"
        description={locationPermissionDescription}
        left={(props) => (
          <List.Icon {...props} icon="map-marker" color={iconColorLocation} />
        )}
        right={() => (
          <Button
            mode="contained"
            compact
            onPress={handleRequestLocationPermission}
            disabled={locationPermissionButtonDisabled}
          >
            {locationPermissionStatusDisplayText}
          </Button>
        )}
      />

      {/* Permission Granted Dialog */}
      <LocationPermissionGrantedDialog
        permissionGrantedDialogVisible={permissionGrantedDialogVisible}
        setPermissionGrantedDialogVisible={setPermissionGrantedDialogVisible}
      />

      {/* Permission Denied Dialog */}
      <LocationPermissionDeniedDialog
        permissionDeniedDialogVisible={permissionDeniedDialogVisible}
        setPermissionDeniedDialogVisible={setPermissionDeniedDialogVisible}
      />
    </>
  );
};

export default LocationPermissionSetting;
