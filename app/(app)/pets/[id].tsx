import { supabase } from "@/components/supabase-client";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { View } from "react-native";
import { Button, Text } from "react-native-paper";
import { AuthContext } from "@/components/Provider/auth-provider";
import {
  onPetLost,
  onEditPet,
  useConfirmDelete,
  viewPetSightings,
  useConfirmPetFound,
} from "@/components/pets/pet-crud";
import RenderPetDetails from "@/components/pets/pet-details";
import { SupabasePetRepository } from "@/db/repositories/supabase/pet-repository";
import { SightingPet } from "@/components/wizard/wizard-interface";

export default function PetProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [pet, setPet] = useState<SightingPet | undefined>(undefined);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);
  const onConfirmDelete = useConfirmDelete();
  const onPetFound = useConfirmPetFound();
  const petRepository = new SupabasePetRepository(supabase);

  useEffect(() => {
    setLoading(true);
    petRepository.getPet(id)
      .then(( data ) => {
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
