import { SightingWizard } from "@/components/wizard2.0/wizard";
import { PET_FIELDS_CLEARED } from "@/components/wizard2.0/wizard-constants";
import { WizardConfig } from "@/components/wizard2.0/wizard-types";
import { PetRepository } from "@/db/repositories/pet-repository";
import { SightingRepository } from "@/db/repositories/sighting-repository";
import usePhotoAnalyzeStep from "@/lib/photo-analysis/use-photo-analyze";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { showMessage } from "react-native-flash-message";

export default function EditPet() {
  const { petId } = useLocalSearchParams<{ petId: string }>();
  const [initialData, setInitialData] = useState(PET_FIELDS_CLEARED);
  const { t } = useTranslation("wizard");
  const router = useRouter();
  const onPhotoAnalyze = usePhotoAnalyzeStep();

  useEffect(() => {
    if (!petId) {
      return;
    }
    const petRepository = new PetRepository();
    petRepository
      .getPet(petId)
      .then((data) => {
        if (data) {
          setInitialData(data);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, [petId]);

  const config: WizardConfig = useMemo(
    () => [
      {
        id: "start",
        title: t("reportALostPet", "Report a lost pet"),
        subtitle: t(
          "thankYouForHelping",
          "Thank you for helping bring our lost friends home.",
        ),
        nextActionName: t("continue", "Continue"),
        onComplete: () => undefined,
        skip: () => true,
      },
      {
        id: "choose_pet",
        title: t("selectAPetProfile", "Select a pet profile"),
        subtitle: t(
          "sorryToHearYourPetIsMissing",
          "Sorry to hear your pet is missing. Let's bring them back!",
        ),
        nextActionName: t("continue", "Continue"),
        onComplete: () => undefined,
        skip: () => true,
      },
      {
        id: "upload_photo",
        title: t("uploadAPhoto", "Upload a photo"),
        subtitle: t(
          "aPhotoWouldReallyHelpIdentifyThisPetFaster",
          "A photo would really help identify this pet faster.",
        ),
        nextActionName: t("continue", "Continue"),
        onComplete: async (data) => {
          return onPhotoAnalyze(data.images);
        },
      },
      {
        id: "edit_pet",
        title: t("whatDidThePetLookLike", "What did the pet look like?"),
        subtitle: t(
          "reviewAndEditPetDescription",
          "Review and edit pet description",
        ),
        nextActionName: t("continue", "Continue"),
        onComplete: () => undefined,
      },
      {
        id: "edit_pet_continued",
        title: t(
          "whatDidThePetLookLikeCont",
          "What did the pet look like? (Cont.)",
        ),
        subtitle: t(
          "reviewAndEditPetDescription",
          "Review and edit pet description",
        ),
        nextActionName: t("continue", "Continue"),
        onComplete: () => undefined,
      },
      {
        id: "last_seen",
        title: t(
          "whenAndWhereWasThePetLastSeen",
          "When and where was the pet last seen?",
        ),
        subtitle: t(
          "selectADateAndTimeThenPlaceAPin",
          "Select a date and time, then place a pin on the map.",
        ),
        nextActionName: t("continue", "Continue"),
        skip: (data) => !data.isLost,
        onComplete: () => undefined,
      },
      {
        id: "add_contact",
        title: t("updateYourContactInfo", "Update your contact info."),
        subtitle: t(
          "reviewAndEditYourContactInfo",
          "Review and edit your contact info.",
        ),
        nextActionName: t("submitReport", "Submit report"),
        onComplete: async (data) => {
          if (data.id) {
            const petRepository = new PetRepository();
            return petRepository
              .updatePet(data.id, data)
              .then(() => {
                showMessage({
                  message: t(
                    "successfullyUpdatedPetProfile",
                    "Successfully updated pet profile.",
                  ),
                  type: "success",
                  icon: "success",
                  statusBarHeight: 50,
                });
              })
              .catch((error) => {
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
              });
          } else {
            throw new Error("Not pet info found.");
          }
        },
      },
    ],
    [t],
  );

  return (
    <SightingWizard
      initialData={{ ...initialData, reportType: "edit_pet" }}
      config={config}
      onFinish={() => router.back()}
      onCancel={() => router.back()}
    />
  );
}
