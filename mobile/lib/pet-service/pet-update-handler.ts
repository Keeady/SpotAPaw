import { SightingFormData } from "@/components/wizard2.0/wizard-types";
import { PetRepository } from "@/db/repositories/pet-repository";
import { TFunction } from "i18next";
import { showMessage } from "react-native-flash-message";

export default async function handlePetUpdate(
  t: TFunction<"wizard", undefined>,
  petId: string,
  data: SightingFormData,
) {
  try {
    const petRepository = new PetRepository();
    await petRepository.updatePet(petId, data);
    showMessage({
      message: t(
        "successfullyUpdatedPetProfile",
        "Successfully updated pet profile.",
      ),
      type: "success",
      icon: "success",
      statusBarHeight: 50,
    });
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

    return Promise.reject(error);
  }
}
