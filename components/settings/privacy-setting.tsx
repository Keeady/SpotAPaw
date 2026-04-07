import { List } from "react-native-paper";

const PrivacySetting = ({ iconColorPrivacy, onOpenPrivacyPolicy }: any) => {
  return (
    <List.Item
      title="Privacy Policy"
      description="Learn how we handle your data"
      left={(props) => (
        <List.Icon {...props} icon="shield-account" color={iconColorPrivacy} />
      )}
      onPress={onOpenPrivacyPolicy}
    />
  );
};

export default PrivacySetting;
