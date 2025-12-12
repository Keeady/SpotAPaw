import * as React from "react";
import { FAB, Portal, useTheme } from "react-native-paper";

type ReportLostPetFabProps = {
  onChatbotPress: () => void;
  onFormPress: () => void;
};

type FABGroupStateChangeProps = {
  open: boolean;
};

export default function ReportLostPetFab({
  onChatbotPress,
  onFormPress,
}: ReportLostPetFabProps) {
  const theme = useTheme();
  const [state, setState] = React.useState<FABGroupStateChangeProps>({
    open: false,
  });

  const onStateChange = ({ open }: FABGroupStateChangeProps) =>
    setState({ open });

  const { open } = state;

  return (
    <Portal>
      <FAB.Group
        open={open}
        visible
        icon={open ? "close" : "plus"}
        onStateChange={onStateChange}
        fabStyle={{ backgroundColor: theme.colors.primary }}
        color={theme.colors.onPrimary}
        actions={[
          {
            icon: "message-outline",
            label: "Report via Chatbot",
            onPress: onChatbotPress,
            style: { backgroundColor: theme.colors.primary },
            color: theme.colors.onPrimary,
            labelStyle: { color: theme.colors.onPrimary },
          },
          {
            icon: "form-select",
            label: "Fill Out Form",
            onPress: onFormPress,
            style: { backgroundColor: theme.colors.primary },
            color: theme.colors.onPrimary,
            labelStyle: { color: theme.colors.onPrimary },
          },
        ]}
        backdropColor={"rgba(0,0,0,0.8)"}
        style={{ position: "absolute", bottom: 20, right: 5 }}
        variant={"primary"}
        label="Report"
      />
    </Portal>
  );
}
