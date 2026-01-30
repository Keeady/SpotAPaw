import { Divider, Text } from "react-native-paper";
import { View, StyleSheet } from "react-native";

type DividerWithTextProps = {
  text: string;
};

export default function DividerWithText({ text }: DividerWithTextProps) {
  return (
    <View style={styles.dividerContainer}>
      <Divider style={styles.divider} />
      <Text variant="bodySmall" style={styles.dividerText}>
        {text}
      </Text>
      <Divider style={styles.divider} />
    </View>
  );
}

const styles = StyleSheet.create({
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  divider: {
    flex: 1,
  },
  dividerText: {
    paddingHorizontal: 12,
  },
});
