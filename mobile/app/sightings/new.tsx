import { useUploadMultiplePetImage } from "@/components/image-upload-handler";
import { SightingWizard } from "@/components/wizard2.0/wizard";
import { PET_FIELDS_CLEARED } from "@/components/wizard2.0/wizard-constants";
import {
  SightingFormData,
  WizardConfig,
} from "@/components/wizard2.0/wizard-types";
import { PetRepository } from "@/db/repositories/pet-repository";
import { SightingRepository } from "@/db/repositories/sighting-repository";
import handlePhotoUploadAnalyze from "@/lib/photo-analysis/photo-upload-handler";
import usePhotoAnalyzeStep from "@/lib/photo-analysis/use-photo-analyze";
import handleSightingCreation from "@/lib/sighting-service/sighting-create-handler";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { showMessage } from "react-native-flash-message";

export default function NewSighting() {
  const { t } = useTranslation("wizard");
  const router = useRouter();
  const onPhotoAnalyze = usePhotoAnalyzeStep();
  const { uploadMultiplePetImages } = useUploadMultiplePetImage();

  const config: WizardConfig = useMemo(
    () => [
      {
        id: "start",
        title: t("reportALostPet", "Report a lost pet"),
        subtitle: t(
          "thankYouForHelping",
          "Thank you for helping bring our lost friends home.",
        ),
        nextActionName: () => t("continue", "Continue"),
        onComplete: (data) =>
          data.reportType === "found_stray" ? PET_FIELDS_CLEARED : undefined,
      },
      {
        id: "choose_pet",
        title: t("selectAPetProfile", "Select a pet profile"),
        subtitle: t(
          "sorryToHearYourPetIsMissing",
          "Sorry to hear your pet is missing. Let's bring them back!",
        ),
        nextActionName: () => t("continue", "Continue"),
        onComplete: async (data) => {
          // fetch pet
          if (data.id) {
            const petRepository = new PetRepository();
            const pet = await petRepository.getPet(data.id);
            return {
              ...data,
              ...pet,
            };
          }
        },
        skip: (data) => data.reportType === "found_stray",
      },
      {
        id: "upload_photo",
        title: t("uploadAPhoto", "Upload a photo"),
        subtitle: t(
          "aPhotoWouldReallyHelpIdentifyThisPetFaster",
          "A photo would really help identify this pet faster.",
        ),
        nextActionName: () => t("continue", "Continue"),
        onComplete: async (data) => {
          if (data.images) {
            return await handlePhotoUploadAnalyze(
              onPhotoAnalyze,
              data.images,
              data.id ?? null,
              null,
            );
          }
        },
      },
      {
        id: "edit_pet",
        title: t("whatDidThePetLookLike", "What did the pet look like?"),
        subtitle: t(
          "reviewAndEditPetDescription",
          "Review and edit pet description",
        ),
        nextActionName: () => t("continue", "Continue"),
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
        nextActionName: () => t("continue", "Continue"),
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
        nextActionName: () => t("continue", "Continue"),
        onComplete: () => undefined,
      },
      {
        id: "add_contact",
        title: t("updateYourContactInfo", "Update your contact info."),
        subtitle: t(
          "reviewAndEditYourContactInfo",
          "Review and edit your contact info.",
        ),
        nextActionName: () => t("submit", "Submit report"),
        onComplete: async (data) => {
          if (data) {
           return await handleSightingCreation(t, data)
          }
        },
      },
    ],
    [t, onPhotoAnalyze, uploadMultiplePetImages],
  );

  return (
    <SightingWizard
      initialData={PET_FIELDS_CLEARED}
      config={config}
      onFinish={() => router.back()}
      onCancel={() => router.back()}
    />
  );
}
