import { ActivityIndicator, View } from "react-native";
import { Button, Icon, Text } from "react-native-paper";

interface AIAnalysisBannerProps {
  loading: boolean;
  onSettingsPress: () => void;
}

export default function AIAnalysisBanner({
  loading,
  onSettingsPress,
}: AIAnalysisBannerProps) {
  return (
    <View>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {loading ? (
          <>
            <ActivityIndicator size="small" color="#1976d2" />
            <Text variant="labelMedium">Analyzing photo with AI...</Text>
          </>
        ) : (
          <>
            <Icon source={"creation-outline"} size={20} />
            <Text variant="labelMedium">
              We&#39;ve analyzed your photo using AI. Results may not be 100%
              accurate.
            </Text>
          </>
        )}
      </View>
      <Button mode="text" onPress={onSettingsPress}>
        Manage AI Analysis Settings
      </Button>
    </View>
  );
}

type AIFieldAnalysisBannerProps = {
  loading: boolean;
  aiGenerated: boolean;
};

export function AIFieldAnalysisBanner({
  loading,
  aiGenerated,
}: AIFieldAnalysisBannerProps) {
  if (loading || !aiGenerated) {
    return null;
  }

  return (
    <View style={{ flexDirection: "row", gap: 8, alignSelf: "flex-end" }}>
      <Icon source={"creation-outline"} size={15} />
      <Text variant="labelSmall">AI-suggested</Text>
    </View>
  );
}
