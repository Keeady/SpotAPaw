import { supabase } from "../supabase-client";
import { showMessage } from "react-native-flash-message";
import { router } from "expo-router";
import { useCallback } from "react";
import { Alert } from "react-native";
import { Pet } from "@/model/pet";
import { log } from "../logs";

export const useConfirmDelete = () =>
  useCallback(
    (petName: string, petId: string, userId: string) =>
      Alert.alert(
        `Deleting Pet ${petName}`,
        `Are you sure you want to delete ${petName}'s profile?`,
        [
          {
            text: "Cancel",
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel",
          },
          {
            text: "Yes, please delete",
            onPress: () => onDeletePet(petId, userId),
          },
        ],
        {
          userInterfaceStyle: "dark",
        }
      ),
    []
  );

export async function onDeletePet(id: string, userId: string) {
  const { error } = await supabase
    .from("pets")
    .delete()
    .eq("id", id)
    .eq("owner_id", userId)
    .select();

  if (error) {
    log(error.message);
    showMessage({
      message: "Error deleting pet profile.",
      type: "warning",
      icon: "warning",
    });
  } else {
    showMessage({
      message: "Successfully deleted pet profile.",
      type: "success",
      icon: "success",
    });
    router.replace(`/(app)/pets`);
  }
}

export function onEditPet(id: string) {
  router.navigate(`/(app)/pets/edit?id=${id}`);
}

export function onPetLost(id: string) {
  router.navigate(`/(app)/pets/edit?id=${id}&is_lost=true`);
}

export async function onPetFound(id: string) {
  const { error } = await supabase
    .from("pets")
    .update({
      is_lost: false,
    })
    .eq("id", id);

  if (error) {
    log(error.message);
    showMessage({
      message: "Error updating pet profile.",
      type: "warning",
      icon: "warning",
    });
    return;
  } else {
    const { error } = await supabase
      .from("sightings")
      .update({
        is_active: false,
      })
      .eq("pet_id", id);

    if (error) {
      log(error.message);
      showMessage({
        message: "Error updating pet profile.",
        type: "warning",
        icon: "warning",
      });
      return;
    } else {
      showMessage({
        message: "Successfully updated pet profile.",
        type: "success",
        icon: "success",
      });
    }
  }
  router.replace(`/(app)/pets/${id}`);
}

export async function createNewPet(profileInfo: Pet, userId: string) {
  if (!profileInfo) {
    return;
  }

  const { error } = await supabase
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
        owner_id: userId,
      },
    ])
    .select();

  if (error) {
    log(error.message);
    showMessage({
      message: "Error creating pet profile. Please try again.",
      type: "warning",
      icon: "warning",
    });
    return;
  } else {
    router.replace(`/(app)/pets`);
  }
}
