import { t } from "i18next";
import { List } from "react-native-paper";

const AboutSection = ({
  onPress,
  iconColorInformation,
}: {
  onPress: () => void;
  iconColorInformation: string;
}) => (
  <List.Section>
    <List.Subheader>{t("about")}</List.Subheader>
    <List.Item
      title={t("aboutSpotapaw")}
      description={t("learnMoreAboutTheApp", { ns: "settings" })}
      left={(props) => (
        <List.Icon {...props} icon="information" color={iconColorInformation} />
      )}
      onPress={onPress}
    />
  </List.Section>
);

export default AboutSection;
