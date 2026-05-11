import { List } from "react-native-paper";
import { DistanceSelectionDialog } from "../location-request-util";
import { useTranslation } from "react-i18next";

const DistanceSetting = ({
  iconColorDistance,
  defaultDistance,
  selectedDistance,
  onDistancePress,
  distanceDialogVisible,
  handleDistanceChange,
}: {
  iconColorDistance: string;
  defaultDistance: string;
  selectedDistance: string;
  onDistancePress: (status: boolean) => void;
  distanceDialogVisible: boolean;
  handleDistanceChange: (distance: string) => Promise<void>;
}) => {
  const { t } = useTranslation(["settings", "translation"]);
  const defaultDistanceValue = selectedDistance || defaultDistance;

  return (
    <>
      <List.Item
        title={t("defaultDistance")}
        description={t("defaultdistancevalueKmRadius", {
          defaultDistanceValue,
        })}
        left={(props) => (
          <List.Icon
            {...props}
            icon="map-marker-distance"
            color={iconColorDistance}
          />
        )}
        onPress={() => onDistancePress(true)}
      />
      <DistanceSelectionDialog
        distanceDialogVisible={distanceDialogVisible}
        setDistanceDialogVisible={onDistancePress}
        handleDistanceChange={handleDistanceChange}
        defaultDistance={defaultDistanceValue}
      />
    </>
  );
};

export default DistanceSetting;
