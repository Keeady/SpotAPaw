import { SightingFormData } from "@/components/wizard2.0/wizard-types";
import { PetRepository } from "@/db/repositories/pet-repository";
import { TFunction } from "i18next";
import { showMessage } from "react-native-flash-message";

export default async function handlePetCreation(
  t: TFunction<"wizard", undefined>,
  data: SightingFormData,
) {
  try {
    const petRepository = new PetRepository();
    const petId = await petRepository.createPet(data);
    if (petId) {
      showMessage({
        message: t(
          "successfullyAddedPetProfile",
          "Successfully added pet profile.",
        ),
        type: "success",
        icon: "success",
        statusBarHeight: 50,
      });
      return {
        ...data,
        id: petId,
      };
    }
  } catch (error) {
    console.log(error);
    showMessage({
      message: t(
        "errorSavingPetProfilePleaseTryAgain",
        "Error saving pet profile. Please try again.",
      ),
      type: "warning",
      icon: "warning",
      statusBarHeight: 50,
    });

    throw error;
  }
}
