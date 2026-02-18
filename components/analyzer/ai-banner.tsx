import { View } from "react-native";
import { Icon, Text } from "react-native-paper";

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
