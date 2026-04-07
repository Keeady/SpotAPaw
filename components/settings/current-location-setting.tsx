import { List } from "react-native-paper";

const CurrentLocationSetting = ({
  locationUsedDisplayText,
  iconColorLocationCheck,
}: {
  locationUsedDisplayText: string;
  iconColorLocationCheck: string;
}) => {
  return (
      <List.Item
        title="Current Location"
        description={locationUsedDisplayText}
        left={(props) => (
          <List.Icon
            {...props}
            icon="map-marker-check"
            color={iconColorLocationCheck}
          />
        )}
      />
  );
};

export default CurrentLocationSetting;
