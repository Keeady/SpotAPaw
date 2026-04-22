import { List } from "react-native-paper";

const TermsSetting = ({
  iconColorTerms,
  onOpenTermsOfService,
}: {
  iconColorTerms: string;
  onOpenTermsOfService: () => void;
}) => {
  return (
    <List.Item
      title="Terms of Service"
      description="Read our terms and conditions"
      left={(props) => (
        <List.Icon {...props} icon="file-document" color={iconColorTerms} />
      )}
      onPress={onOpenTermsOfService}
    />
  );
};

export default TermsSetting;
