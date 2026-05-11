import { useTranslation } from "react-i18next";
import { List } from "react-native-paper";
import { useProContext } from "../Provider/pro-context-provider";

const ProSettings = ({
  iconColorPro,
  iconColorAIOn,
  iconColorAIOff,
}: {
  iconColorPro: string;
  iconColorAIOn: string;
  iconColorAIOff: string;
}) => {
  const { t } = useTranslation(["settings", "translation"]);
  const { isProUser } = useProContext();

  return (
    <>
      <List.Section>
        <List.Subheader>{t("proFeatures", "PRO Features")}</List.Subheader>
        <List.Item
          title={t("aiPhotoAnalysis", "Unlimited AI Photo Analysis")}
          description={t(
            "aiPhotoAnalysisDescription",
            "Unlock unlimited AI photo analysis for pet identification. Free for 1 pet profile.",
          )}
          descriptionNumberOfLines={5}
          left={(props) => (
            <List.Icon {...props} icon="creation-outline" color={iconColorPro} />
          )}
          right={() => (
            <List.Icon
              icon={isProUser ? "check" : "lock"}
              color={isProUser ? iconColorAIOn : iconColorAIOff}
            />
          )}
        />
        <List.Item
          title={t("expandedSearch", "Expanded Search Radius")}
          description={t(
            "expandedSearchDescription",
            "Our default search radius is 5 miles for everyone, up to 25 miles for Pro users.",
          )}
          descriptionNumberOfLines={5}
          left={(props) => (
            <List.Icon {...props} icon="map-marker-radius" color={iconColorPro} />
          )}
          right={() => (
            <List.Icon
              icon={isProUser ? "check" : "lock"}
              color={isProUser ? iconColorAIOn : iconColorAIOff}
            />
          )}
        />
      </List.Section>
    </>
  );
};

export default ProSettings;
