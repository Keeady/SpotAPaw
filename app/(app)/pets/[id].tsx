import { AuthContext } from "@/components/Provider/auth-provider";
import {
  onEditPet,
  onPetLost,
  useConfirmDelete,
  useConfirmPetFound,
  viewPetSightings,
} from "@/components/pets/pet-crud";
import RenderPetDetails from "@/components/pets/pet-details";
import { SightingPet } from "@/components/wizard/wizard-interface";
import { PetRepository } from "@/db/repositories/pet-repository";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { View } from "react-native";
import { Button, Text } from "react-native-paper";

export default function PetProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [pet, setPet] = useState<SightingPet | undefined>(undefined);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);
  const onConfirmDelete = useConfirmDelete();
  const onPetFound = useConfirmPetFound();

  useEffect(() => {
    setLoading(true);
    const petRepository = new PetRepository();
    petRepository.getPet(id).then((data) => {
      setLoading(false);
      setPet(data);
    });
  }, [id]);

  if (!user) {
    return null;
  }

  if (loading) {
    return <Text>Loading ...</Text>;
  }

  if (!pet) {
    return (
      <View>
        <Button onPress={() => router.navigate("/(app)/pets/new")}>
          Add Pet
        </Button>
      </View>
    );
  }

  return (
    <RenderPetDetails
      pet={pet}
      onDeletePet={() => onConfirmDelete(pet.name, pet.id, user.id)}
      onEditPet={() => onEditPet(pet.id)}
      onPetLost={() => onPetLost(pet.id)}
      onPetFound={() => onPetFound(pet.name, pet.id)}
      viewPetSightings={() => viewPetSightings(pet.id)}
    />
  );
}
