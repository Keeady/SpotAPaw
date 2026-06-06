import { View } from "react-native";
import { Icon, Text } from "react-native-paper";

type AIFieldAnalysisBannerProps = {
  loading: boolean;
  aiGenerated: boolean;
  helperText?: React.ReactNode;
};

export function AIFieldAnalysisBannerOrHelperText({
  loading,
  aiGenerated,
  helperText,
}: AIFieldAnalysisBannerProps) {
  if (loading) {
    return null;
  }

  if (!aiGenerated) {
    return helperText;
  }

  return (
    <View style={{ flexDirection: "row", gap: 8, alignSelf: "flex-end" }}>
      <Icon source={"creation-outline"} size={15} />
      <Text variant="labelSmall">AI-suggested</Text>
    </View>
  );
}
