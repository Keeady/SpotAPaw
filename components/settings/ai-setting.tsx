import { List, Switch } from "react-native-paper";
import { useTranslation } from 'react-i18next'

const AISetting = ({
  iconColorAI,
  aiFeatureEnabled,
  onToggleAIFeature,
}: {
  iconColorAI: string;
  aiFeatureEnabled: boolean;
  onToggleAIFeature: (value: boolean) => void;
}) => {
  const { t } = useTranslation(["settings", "translation"]);
  return (
    <List.Item
      title={t("aiImageAnalysis")}
      description={t("enableImageAnalysisForPetIdentification")}
      left={(props) => (
        <List.Icon {...props} icon="creation-outline" color={iconColorAI} />
      )}
      right={() => (
        <Switch value={aiFeatureEnabled} onValueChange={onToggleAIFeature} testID="ai-switch" />
      )}
    />
  );
};

export default AISetting;
