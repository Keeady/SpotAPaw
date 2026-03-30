import { router } from "expo-router";
import { useCallback } from "react";
import { Alert } from "react-native";
import { showMessage } from "react-native-flash-message";
import { PetRepository } from "@/db/repositories/pet-repository";
import { SightingRepository } from "@/db/repositories/sighting-repository";
import { log } from "../logs";
import { createErrorLogMessage } from "../util";

export const useConfirmDelete = () =>
  useCallback(
    (petName: string, petId: string, userId: string) =>
      Alert.alert(
        `Deleting Pet ${petName}`,
        `Are you sure you want to delete ${petName}'s profile?`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Yes, please delete",
            onPress: () => onDeletePet(petId, userId),
          },
        ],
        {
          userInterfaceStyle: "dark",
        },
      ),
    [],
  );

export const useConfirmPetFound = () =>
  useCallback(
    (petName: string, petId: string) =>
      Alert.alert(
        `Confirm Pet Found: ${petName}!`,
        `Marking this pet as found will deactivate all public sightings immediately.\n\nThese sightings will be permanently deleted after 7 days.`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Confirm",
            onPress: () => onPetFound(petId),
          },
        ],
        {
          userInterfaceStyle: "dark",
        },
      ),
    [],
  );

export async function onDeletePet(id: string, userId: string) {
  const petRepository = new PetRepository();
  await petRepository
    .deletePet(id, userId)
    .then(() => {
      showMessage({
        message: "Successfully deleted pet profile.",
        type: "success",
        icon: "success",
        statusBarHeight: 50,
      });
      router.replace(`/(app)/pets`);
    })
    .catch((error) => {
      const errorMessage = createErrorLogMessage(error);
      log(`Failed to delete pet: ${errorMessage}`);
      showMessage({
        message: "Error deleting pet profile.",
        type: "warning",
        icon: "warning",
        statusBarHeight: 50,
      });
    });
}

export function onEditPet(id: string, sightingId?: string) {
  if (sightingId) {
    router.navigate(`/(app)/pets/edit?petId=${id}&id=${sightingId}`);
    return;
  }
  router.navigate(`/(app)/pets/edit?petId=${id}`);
}

export function onPetLost(id: string) {
  router.navigate(`/(app)/pets/edit?petId=${id}&is_lost=true`);
}

async function onPetFound(id: string) {
  const petRepository = new PetRepository();
  const sightingRepository = new SightingRepository();
  petRepository
    .updatePet(id, { isLost: false })
    .then(async () => {
      sightingRepository
        .updateSightingStatusByPet(id)
        .then(() => {
          showMessage({
            message: "Successfully updated pet profile.",
            type: "success",
            icon: "success",
            statusBarHeight: 50,
          });
        })
        .catch((error) => {
          const errorMessage = createErrorLogMessage(error);
          log(`Failed to update sighting status for pet: ${errorMessage}`);
          showMessage({
            message: "Error updating pet profile.",
            type: "warning",
            icon: "warning",
            statusBarHeight: 50,
          });
        });

      router.replace(`/(app)/pets`);
    })
    .catch((error) => {
      const errorMessage = createErrorLogMessage(error);
      log(`Failed to update pet as found: ${errorMessage}`);
      showMessage({
        message: "Error updating pet profile.",
        type: "warning",
        icon: "warning",
        statusBarHeight: 50,
      });
    });
}

export async function viewPetSightings(
  id: string,
  linkedSightingId: string,
  petId: string,
) {
  if (!id) {
    router.navigate(`/(app)/my-sightings`);
    return;
  }
  router.navigate(
    `/(app)/my-sightings/${id}?petId=${petId}&linkedSightingId=${linkedSightingId}`,
  );
}
