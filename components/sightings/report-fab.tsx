import * as React from "react";
import { FAB, Portal } from "react-native-paper";

type ReportLostPetFabProps = {
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
        style={{ position: "absolute", bottom: 16, right: 16 }}
        variant={"primary"}
        label={title}
        onPress={onFormPress}
      />
    </Portal>
  );
}
