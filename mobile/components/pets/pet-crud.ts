import { router } from "expo-router";
import { useCallback } from "react";
import { Alert } from "react-native";
import { showMessage } from "react-native-flash-message";
import { PetRepository } from "@/db/repositories/pet-repository";
import { SightingRepository } from "@/db/repositories/sighting-repository";
import { log } from "../logs";
import { createErrorLogMessage } from "../util";
import { TFunction } from "i18next";

export const useConfirmDelete = () =>
  useCallback(
    (petName: string, petId: string, userId: string, t: TFunction) =>
      Alert.alert(
        t("deletingPet", `Deleting Pet ${petName}`, {
          petName,
          ns: "petprofile",
        }),
        t(
          "confirmDeleteMessage",
          `Are you sure you want to delete ${petName}'s profile?`,
          { petName, ns: "petprofile" },
        ),
        [
          {
            text: t("cancel", "Cancel", { ns: "translation" }),
            style: "cancel",
          },
          {
            text: t("yesPleaseDelete", "Yes, please delete", {
              ns: "translation",
            }),
            onPress: () => onDeletePet(petId, userId, t),
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
    (petName: string, petId: string, t: TFunction) =>
      Alert.alert(
        t("confirmPetFoundTitle", `Confirm Pet Found: ${petName}!`, {
          petName,
          ns: "petprofile",
        }),
        t(
          "confirmPetFoundMessage",
          "Marking this pet as found will deactivate all public sightings immediately.\n\nThese sightings will be permanently deleted after 7 days.",
          { ns: "petprofile" },
        ),
        [
          {
            text: t("cancel", "Cancel", { ns: "translation" }),
            style: "cancel",
          },
          {
            text: t("confirm", "Confirm", { ns: "translation" }),
            onPress: () => onPetFound(petId, t),
          },
        ],
        {
          userInterfaceStyle: "dark",
        },
      ),
    [],
  );

export async function onDeletePet(id: string, userId: string, t: TFunction) {
  const petRepository = new PetRepository();
  await petRepository
    .deletePet(id, userId)
    .then(() => {
      showMessage({
        message: t(
          "successfullyDeletedPetProfile",
          "Successfully deleted pet profile.",
          { ns: "petprofile" },
        ),
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
        message: t("errorDeletingPetProfile", "Error deleting pet profile.", {
          ns: "petprofile",
        }),
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

async function onPetFound(id: string, t: TFunction) {
  const petRepository = new PetRepository();
  const sightingRepository = new SightingRepository();
  petRepository
    .updatePet(id, { isLost: false })
    .then(async () => {
      sightingRepository
        .updateSightingStatusByPet(id)
        .then(() => {
          showMessage({
            message: t(
              "successfullyUpdatedPetProfile",
              "Successfully updated pet profile.",
              { ns: "petprofile" },
            ),
            type: "success",
            icon: "success",
            statusBarHeight: 50,
          });
        })
        .catch((error) => {
          const errorMessage = createErrorLogMessage(error);
          log(`Failed to update sighting status for pet: ${errorMessage}`);
          showMessage({
            message: t(
              "errorUpdatingPetProfile",
              "Error updating pet profile.",
              { ns: "petprofile" },
            ),
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
        message: t("errorUpdatingPetProfile", "Error updating pet profile.", {
          ns: "petprofile",
        }),
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
