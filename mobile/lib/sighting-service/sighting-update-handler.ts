import { SightingFormData } from "@/components/wizard2.0/wizard-types";
import { SightingRepository } from "@/db/repositories/sighting-repository";
import { TFunction } from "i18next";
import { showMessage } from "react-native-flash-message";

export default async function handleSightingUpdate(
  t: TFunction<"wizard", undefined>,
  sightingId: string,
  data: SightingFormData,
) {
  try {
    const repository = new SightingRepository();
    await repository.updateSighting(sightingId, data);
    showMessage({
      message: t(
        "successfullyUpdatedPetSighting",
        "Successfully updated pet sighting.",
      ),
      type: "success",
      icon: "success",
      statusBarHeight: 50,
    });
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
    throw error;
  }
}
