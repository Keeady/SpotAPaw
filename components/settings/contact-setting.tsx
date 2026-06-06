import { List } from "react-native-paper";
import { useTranslation } from "react-i18next";

interface ContactSettingProps {
  iconColorContact: string;
  onOpenContact: () => void;
}

const ContactSetting = ({
  iconColorContact,
  onOpenContact,
}: ContactSettingProps) => {
  const { t } = useTranslation(["settings", "translation"]);
  return (
    <List.Item
      title={t("contactUs", "Contact Us")}
      description={t("getInTouchWithUs", "Get in touch or send us your feedback!")}
      left={(props) => (
        <List.Icon {...props} icon="email" color={iconColorContact} />
      )}
      onPress={onOpenContact}
    />
  );
};

export default ContactSetting;
