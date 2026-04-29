import * as React from "react";
import { useTranslation } from "react-i18next";
import { FAB, Portal, useTheme } from "react-native-paper";

type ReportLostPetFabProps = {
  onFormPress: () => void;
  handleShare: () => void;
  title: string;
  showGroup: boolean;
};

type FABGroupStateChangeProps = {
  open: boolean;
};

export default function ReportLostPetFab({
  handleShare,
  onFormPress,
  title,
  showGroup,
}: ReportLostPetFabProps) {
  const theme = useTheme();
  const {t} = useTranslation("translation");

  const [state, setState] = React.useState<FABGroupStateChangeProps>({
    open: false,
  });

  const onStateChange = ({ open }: FABGroupStateChangeProps) =>
    setState({ open });

  const { open } = state;

  if (!showGroup) {
    return (
      <Portal>
        <FAB
          visible
          icon={"plus"}
          style={{ position: "absolute", bottom: 16, right: 16 }}
          variant={"primary"}
          label={t(title)}
          onPress={onFormPress}
        />
      </Portal>
    );
  }

  return (
    <Portal>
      <FAB.Group
        open={open}
        visible
        icon={open ? "close" : "paw"}
        onStateChange={onStateChange}
        fabStyle={{ backgroundColor: theme.colors.primary }}
        color={theme.colors.onPrimary}
        actions={[
          {
            style: { backgroundColor: theme.colors.primary },
            color: theme.colors.onPrimary,
            labelStyle: { color: theme.colors.onPrimary },
            icon: "share-variant",
            label: t("shareSighting"),
            onPress: handleShare,
          },
          {
            icon: "paw",
            label: t("iveSeenThisPet"),
            onPress: onFormPress,
            style: { backgroundColor: theme.colors.primary },
            color: theme.colors.onPrimary,
            labelStyle: { color: theme.colors.onPrimary },
          },
        ]}
        backdropColor={"rgba(0,0,0,0.8)"}
        style={{ position: "absolute", bottom: 20, right: 5 }}
        variant={"primary"}
        label={t("report")}
      />
    </Portal>
  );
}
