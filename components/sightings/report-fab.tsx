import * as React from "react";
import { FAB, Portal } from "react-native-paper";

type ReportLostPetFabProps = {
  onChatbotPress: () => void;
  onFormPress: () => void;
  title: string;
};

export default function ReportLostPetFab({
  onFormPress,
  title,
}: ReportLostPetFabProps) {
  return (
    <Portal>
      <FAB
        visible
        icon={"plus"}
        style={{ position: "absolute", bottom: 20, right: 5 }}
        variant={"primary"}
        label={title}
        onPress={onFormPress}
      />
    </Portal>
  );
}
