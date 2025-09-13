import { supabase } from "@/components/supabase-client";
import { Pet } from "@/model/pet";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { View } from "react-native";
import { Button, Text } from "react-native-paper";
import { AuthContext } from "@/components/Provider/auth-provider";
import { onPetFound, onPetLost, onEditPet, useConfirmDelete } from "@/components/pets/pet-crud";
import RenderPetDetails from "@/components/pets/pet-details";

export default function PetProfile() {
  const { id } = useLocalSearchParams();
  const [pet, setPet] = useState<Pet | undefined>(undefined);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);
  const onConfirmDelete = useConfirmDelete();

  useEffect(() => {
    setLoading(true);
    supabase
      .from("pets")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => {
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
      onPetFound={() => onPetFound(pet.id)}
    />
  );
}
