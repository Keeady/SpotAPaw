import { List, Switch } from "react-native-paper";

const AISetting = ({
  iconColorAI,
  aiFeatureEnabled,
  onToggleAIFeature,
}: {
  iconColorAI: string;
  aiFeatureEnabled: boolean;
  onToggleAIFeature: (value: boolean) => void;
}) => {
  return (
    <List.Item
      title="AI Image Analysis"
      description="Enable image analysis for pet identification"
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
