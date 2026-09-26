import { List, Switch } from "react-native-paper";
import { useTranslation } from "react-i18next";

const NotificationSetting = ({
  iconColorNotification,
  notificationsEnabled,
  onNotificationPress,
}: {
  iconColorNotification: string;
  notificationsEnabled: boolean;
  onNotificationPress: (value: boolean) => Promise<void>;
}) => {
  const { t } = useTranslation(["settings", "translation"]);
  return (
    <List.Section>
      <List.Subheader>{t("notifications")}</List.Subheader>

      <List.Item
        title={t("pushNotifications")}
        description={t("getNotifiedAboutUpdatesAndEvents")}
        left={(props) => (
          <List.Icon {...props} icon="bell" color={iconColorNotification} />
        )}
        right={() => (
          <Switch
            value={notificationsEnabled}
            onValueChange={onNotificationPress}
            testID="notification-switch"
          />
        )}
      />
    </List.Section>
  );
};

export default NotificationSetting;
