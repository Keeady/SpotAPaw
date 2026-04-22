import { List } from "react-native-paper";
import { DistanceSelectionDialog } from "../location-request-util";

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
  const defaultDistanceValue = selectedDistance || defaultDistance;

  return (
    <>
      <List.Item
        title="Default Distance"
        description={`${defaultDistanceValue} km radius`}
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
