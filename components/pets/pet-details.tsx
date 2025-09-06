import { Button, Card, Divider, Text } from "react-native-paper";
import { Alert, Image, StyleSheet, View } from "react-native";
import { Pet } from "@/model/pet";
import PetProfileCard from "./profile";

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
    <PetProfileCard
      petProfile={{...pet, status: pet.is_lost ? "lost" : "safe"}}
      onEdit={onEdit}
      onPetFound={onPetFound}
      onPetLost={onPetLost}
      createTwoButtonAlert={createTwoButtonAlert}
    />
  );
}
