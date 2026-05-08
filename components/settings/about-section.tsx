import { useTranslation } from "react-i18next";
import { List } from "react-native-paper";

const AboutSection = ({
  onPress,
  iconColorInformation,
}: {
  onPress: () => void;
  iconColorInformation: string;
}) => {
  const { t } = useTranslation(["settings", "translation"]);

  return (
    <List.Section>
      <List.Subheader>{t("about")}</List.Subheader>
      <List.Item
        title={t("aboutSpotapaw", { ns: "translation" })}
        description={t("learnMoreAboutTheApp", { ns: "settings" })}
        left={(props) => (
          <List.Icon
            {...props}
            icon="information"
            color={iconColorInformation}
          />
        )}
        onPress={onPress}
      />
    </List.Section>
  );
};

export default AboutSection;
