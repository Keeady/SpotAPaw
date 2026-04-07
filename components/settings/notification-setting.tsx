import { List, Switch } from "react-native-paper";

const NotificationSetting = ({
    iconColorNotification,
    notificationsEnabled,
    onNotificationPress,
}: {
    iconColorNotification: string;
    notificationsEnabled: boolean;
    onNotificationPress: (value: boolean) => Promise<void>;
}) => {
    return (
        <List.Section>
          <List.Subheader>Notifications</List.Subheader>

          <List.Item
            title="Push Notifications"
            description="Get notified about updates and events"
            left={(props) => (
              <List.Icon
                {...props}
                icon="bell"
                color={iconColorNotification}
              />
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
    )
};

export default NotificationSetting;