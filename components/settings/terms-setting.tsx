import { List } from "react-native-paper";
import { useTranslation } from "react-i18next";

const TermsSetting = ({
  iconColorTerms,
  onOpenTermsOfService,
}: {
  iconColorTerms: string;
  onOpenTermsOfService: () => void;
}) => {
  const { t } = useTranslation(["settings", "translation"]);
  return (
    <List.Item
      title={t("termsOfService")}
      description={t("readOurTermsAndConditions")}
      left={(props) => (
        <List.Icon {...props} icon="file-document" color={iconColorTerms} />
      )}
      onPress={onOpenTermsOfService}
    />
  );
};

export default TermsSetting;
