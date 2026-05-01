import { List } from "react-native-paper";
import { useTranslation } from "react-i18next";

interface PrivacySettingProps {
  iconColorPrivacy: string;
  onOpenPrivacyPolicy: () => void;
}

const PrivacySetting = ({
  iconColorPrivacy,
  onOpenPrivacyPolicy,
}: PrivacySettingProps) => {
  const { t } = useTranslation(["settings", "translation"]);
  return (
    <List.Item
      title={t("privacyPolicy")}
      description={t("learnHowWeHandleYourData")}
      left={(props) => (
        <List.Icon {...props} icon="shield-account" color={iconColorPrivacy} />
      )}
      onPress={onOpenPrivacyPolicy}
    />
  );
};

export default PrivacySetting;
