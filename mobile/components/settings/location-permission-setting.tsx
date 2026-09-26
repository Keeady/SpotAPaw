import { Button, List } from "react-native-paper";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation(["settings", "translation"]);
  return (
    <>
      <List.Item
        title={t("locationPermission")}
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
