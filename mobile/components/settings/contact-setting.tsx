import { List } from "react-native-paper";
import { useTranslation } from "react-i18next";
import ContactFeedbackModal from "./contact-feedback-modal";

interface ContactSettingProps {
  iconColorContact: string;
  onOpenContact: (visible: boolean) => void;
  contactVisible: boolean;
}

const ContactSetting = ({
  iconColorContact,
  onOpenContact,
  contactVisible,
}: ContactSettingProps) => {
  const { t } = useTranslation(["settings", "translation"]);
  return (
    <>
      <List.Item
        title={t("contactUs", "Contact Us")}
        description={t(
          "getInTouchWithUs",
          "Get in touch or send us your feedback!",
        )}
        left={(props) => (
          <List.Icon {...props} icon="email" color={iconColorContact} />
        )}
        onPress={() => onOpenContact(true)}
      />
      <ContactFeedbackModal
        visible={contactVisible}
        onDismiss={() => onOpenContact(false)}
      />
    </>
  );
};

export default ContactSetting;
