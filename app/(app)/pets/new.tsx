import CreatePetDetails from "@/components/pets/pet-create";
import PetDetails from "@/components/pets/pet-details";
import EditPetDetails from "@/components/pets/pet-edit";
import { AuthContext } from "@/components/Provider/auth-provider";
import { supabase } from "@/components/supabase-client";
import { Pet } from "@/model/pet";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { Alert } from "react-native";
import { Text } from "react-native-paper";

export default function addPet() {
  const { id } = useLocalSearchParams();
  const [pet, setPet] = useState();
  const { user } = useContext(AuthContext);
  const [profileInfo, setProfileInfo] = useState<Pet>();
  const router = useRouter();

  async function createNewPet() {
    if (!profileInfo || !user) {
      return;
    }

    const { data, error } = await supabase
      .from("pets")
      .insert([
        {
          name: profileInfo.name,
          species: profileInfo.species,
          breed: profileInfo.breed,
          age: profileInfo.age,
          gender: profileInfo.gender,
          colors: profileInfo.colors,
          features: profileInfo.features,
          photo: profileInfo.photo,
          owner_id: user?.id,
        },
      ])
      .select();

    if (error) {
      Alert.alert("Error creating pet profile. Please try again.");
      return;
    } else {
      router.replace(`/(app)/pets`);
    }

  }

  useEffect(() => {
    if (!id) {
      return;
    }

    supabase
      .from("pets")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data, error }) => {
        setPet(data);
      });
  }, [id]);

  return CreatePetDetails(createNewPet, setProfileInfo);
}
