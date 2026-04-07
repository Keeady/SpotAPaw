import { List } from "react-native-paper";

interface PrivacySettingProps {
  iconColorPrivacy: string;
  onOpenPrivacyPolicy: () => void;
}

const PrivacySetting = ({ iconColorPrivacy, onOpenPrivacyPolicy }: PrivacySettingProps) => {
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
