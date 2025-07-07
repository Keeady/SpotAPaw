import { Link, useRouter } from "expo-router";
import { View } from "react-native";
import { Avatar, Button, Card } from "react-native-paper";

const LeftContent = (props) => <Avatar.Icon {...props} icon="home" />;

export default function Home() {
    const router = useRouter();
  return (
    <Card>
      <Card.Title
        title="Spot A Paw"
        subtitle="Provide your pet info to help locate your pet"
        left={LeftContent}
      />
      <Card.Content>
        <View>
        <Button icon="paw" mode="elevated" onPress={() => router.navigate('/profile')} contentStyle={{width: "100%"}}>
          View Pet Profile
        </Button>
        </View>

        <Button icon="paw" mode="elevated" onPress={() => router.navigate('/start')}>
          Report Lost Pet
        </Button>
        <Button icon="paw" mode="elevated" onPress={() => router.navigate('/start')}>
          Report Pet Sighting
        </Button>
        <Button icon="paw" mode="elevated" onPress={() => router.navigate('/start')}>
          Report Pet Found
        </Button>
      </Card.Content>
    </Card>
  );
}
