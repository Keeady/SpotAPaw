import { List } from "react-native-paper";

const AboutSection = ({
  onPress,
  iconColorInformation,
}: {
  onPress: () => void;
  iconColorInformation: string;
}) => (
  <List.Section>
    <List.Subheader>About</List.Subheader>
    <List.Item
      title="About SpotAPaw"
      description="Learn more about the app"
      left={(props) => (
        <List.Icon {...props} icon="information" color={iconColorInformation} />
      )}
      onPress={onPress}
    />
  </List.Section>
);

export default AboutSection;