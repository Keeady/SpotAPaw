import { List } from "react-native-paper";
import { useTranslation } from 'react-i18next'

const CurrentLocationSetting = ({
  locationUsedDisplayText,
  iconColorLocationCheck,
}: {
  locationUsedDisplayText: string;
  iconColorLocationCheck: string;
}) => {
  const { t } = useTranslation(["settings", "translation"]);
  return (
      <List.Item
        title={t("currentLocation")}
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
