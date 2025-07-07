import { Button, Card, Divider, Text } from "react-native-paper";
import { Alert, Image, StyleSheet, View } from "react-native";
import { Pet } from "@/model/pet";

export default function PetDetails(
  pet: Pet,
  onDelete: () => void,
  onEdit: () => void,
  onPetLost: () => void,
  onPetFound: () => void
) {
  if (!pet) {
    return <Text>No pet details found</Text>;
  }

  const createTwoButtonAlert = () =>
    Alert.alert(
      `Deleting Pet ${pet.name}`,
      `Are you sure you want to delete ${pet.name}'s profile?`,
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        { text: "Yes, please delete", onPress: () => onDelete() },
      ],
      {
        userInterfaceStyle: "dark",
      }
    );

  return (
    <Card>
      {pet?.photo ? (
        <Image
          source={{ uri: pet?.photo }}
          resizeMode="cover"
          style={{
            width: "100%",
            height: 300,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
          }}
        />
      ) : (
        <View style={styles.emptyPreview}>
          <Text>No photo</Text>
        </View>
      )}
      <Card.Content>
        <Text variant="headlineLarge">{pet?.name}</Text>
        <Divider />
        <Divider />
        <Text variant="bodyLarge">
          <Text variant="labelLarge">Species: </Text> {pet?.species}
        </Text>
        <Text variant="bodyLarge">
          <Text variant="labelLarge">Breed: </Text> {pet?.breed}
        </Text>
        <Text variant="bodyLarge">
          <Text variant="labelLarge">Age: </Text> {pet?.age}
        </Text>
        <Text variant="bodyLarge">
          <Text variant="labelLarge">Gender: </Text> {pet?.gender}
        </Text>
        <Text variant="bodyLarge">
          <Text variant="labelLarge">Colors: </Text> {pet?.colors}
        </Text>
        <Text variant="bodyLarge">
          <Text variant="labelLarge">Distinctive Features: </Text>
          {pet?.features}
        </Text>
      </Card.Content>
      <Card.Actions>
        <View style={styles.buttonContainer}>
          <Button
            icon={"paw"}
            theme={{ colors: { primary: "blue" } }}
            mode={"text"}
            style={{ backgroundColor: "transparent", marginTop: 15 }}
            onPress={() => onEdit()}
            compact={true}
          >
            Edit
          </Button>

          <Button
            icon={"paw"}
            theme={{ colors: { primary: "red" } }}
            mode={"text"}
            style={{ backgroundColor: "transparent", marginTop: 15 }}
            onPress={() => createTwoButtonAlert()}
            compact={true}
          >
            Delete
          </Button>

          {pet?.is_lost && (
            <Button
              icon={"paw"}
              theme={{ colors: { primary: "green" } }}
              mode={"text"}
              style={{ backgroundColor: "transparent", marginTop: 15 }}
              onPress={() => onPetFound()}
              compact={true}
            >
              Report Pet Found
            </Button>
          )}
          {!pet?.is_lost && (
            <Button
              icon={"paw"}
              theme={{ colors: { primary: "purple" } }}
              mode={"text"}
              style={{ backgroundColor: "transparent", marginTop: 15 }}
              onPress={() => onPetLost()}
              compact={true}
            >
              Report Lost Pet
            </Button>
          )}
        </View>
      </Card.Actions>
    </Card>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  emptyPreview: {
    width: "100%",
    height: 300,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ddd",
    marginTop: 5,
  },
});
