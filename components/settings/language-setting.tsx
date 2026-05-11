import { List } from "react-native-paper";
import {
  LanguageSelectionDialog,
  SupportedLanguage,
} from "../location-request-util";
import { useTranslation } from "react-i18next";

const LanguageSetting = ({
  iconColorLanguage,
  languageSelectedDescription,
  onLanguagePress,
  languageDialogVisible,
  handleLanguageChange,
  selectedLanguage,
  languages,
}: {
  iconColorLanguage: string;
  languageSelectedDescription: string;
  onLanguagePress: (status: boolean) => void;
  languageDialogVisible: boolean;
  handleLanguageChange: (language: string) => Promise<void>;
  selectedLanguage: string;
  languages: SupportedLanguage[];
}) => {
  const { t } = useTranslation(["settings", "translation"]);
  return (
    <>
      <List.Item
        title={t("language")}
        description={languageSelectedDescription}
        left={(props) => (
          <List.Icon {...props} icon="translate" color={iconColorLanguage} />
        )}
        onPress={() => onLanguagePress(true)}
      />

      <LanguageSelectionDialog
        languageDialogVisible={languageDialogVisible}
        setLanguageDialogVisible={onLanguagePress}
        handleLanguageChange={handleLanguageChange}
        selectedLanguage={selectedLanguage}
        languages={languages}
      />
    </>
  );
};

export default LanguageSetting;
