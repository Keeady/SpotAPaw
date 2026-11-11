import { SightingFormData } from "@/components/wizard2.0/wizard-types";
import { SightingRepository } from "@/db/repositories/sighting-repository";
import { TFunction } from "i18next";
import { showMessage } from "react-native-flash-message";

export default async function handleSightingCreation(
  t: TFunction<"wizard", undefined>,
  data: SightingFormData,
) {
  try {
    const repository = new SightingRepository();
    const id = await repository.createSighting(data);
    if (id) {
      showMessage({
        message: t(
          "successfullyAddedPetSighting",
          "Successfully added pet sighting.",
        ),
        type: "success",
        icon: "success",
        statusBarHeight: 50,
      });

      return {
        ...data,
        sightingId: id,
      };
    }
  } catch (error) {
    console.log(error);

    showMessage({
      message: t(
        "errorSavingSightingInfoPleaseTryAgain",
        "Error saving sighting info. Please try again.",
      ),
      type: "warning",
      icon: "warning",
      statusBarHeight: 50,
    });
    Promise.reject("Failed to create pet sighting.");
  }
}
