import { useUploadMultiplePetImage } from "@/components/image-upload-handler";
import { useAIFeatureContext } from "@/components/Provider/ai-context-provider";
import { useProContext } from "@/components/Provider/pro-context-provider";
import { SightingWizard } from "@/components/wizard2.0/wizard";
import { PET_FIELDS_CLEARED } from "@/components/wizard2.0/wizard-constants";
import {
  SightingFormData,
  WizardConfig,
} from "@/components/wizard2.0/wizard-types";
import handlePetCreation from "@/lib/pet-service/pet-create-handler";
import handlePetImageUpload from "@/lib/pet-service/pet-image-upload";
import handlePhotoUploadAnalyze from "@/lib/photo-analysis/photo-upload-handler";
import usePhotoAnalyzeStep from "@/lib/photo-analysis/use-photo-analyze";
import handleSightingCreation from "@/lib/sighting-service/sighting-create-handler";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

export default function AddPet() {
  const { t } = useTranslation("wizard");
  const router = useRouter();
  const [initialData, _setInitialData] = useState<SightingFormData>({
    ...PET_FIELDS_CLEARED,
    reportType: "new_pet",
  });
  const { uploadMultiplePetImages } = useUploadMultiplePetImage();
  const { aiPhotoAnalysisAllowed } = useProContext();
  const { isAiFeatureEnabled } = useAIFeatureContext();
  const onPhotoAnalyze = usePhotoAnalyzeStep();

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
        onComplete: () => {},
        skip: () => true,
      },
      {
        id: "choose_pet",
        title: t("selectAPetProfile", "Select a pet profile"),
        subtitle: t(
          "sorryToHearYourPetIsMissing",
          "Sorry to hear your pet is missing. Let's bring them back!",
        ),
        nextActionName: () => t("continue", "Continue"),
        onComplete: () => {},
        skip: () => true,
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
          if (data.images && isAiFeatureEnabled && aiPhotoAnalysisAllowed) {
            const response = await handlePhotoUploadAnalyze(
              onPhotoAnalyze,
              data.images,
              null,
              null,
            );

            return response;
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
        nextActionName: (data) =>
          data.isLost ? t("continue", "Continue") : t("submit", "Submit"),
        onComplete: async (data) => {
          let petData = data;
          // upload images
          if (data.images) {
            const response = await handlePetImageUpload(
              t,
              uploadMultiplePetImages,
              data,
              null,
              data.images,
            );

            if (response) {
              petData = response;
            }
          }
          const response = await handlePetCreation(t, petData);

          if (response) {
            return {
              ...response,
              lastSeenLat: undefined,
              lastSeenLong: undefined,
            };
          }

          return {
            ...petData,
            lastSeenLat: undefined,
            lastSeenLong: undefined,
          };
        },
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
        skip: (data) => !data.isLost,
        onComplete: () => {},
      },
      {
        id: "add_contact",
        title: t("updateYourContactInfo", "Update your contact info."),
        subtitle: t(
          "reviewAndEditYourContactInfo",
          "Review and edit your contact info.",
        ),
        nextActionName: () => t("submit", "Submit report"),
        skip: (data) => !data.isLost,
        onComplete: async (data) => {
          if (data && data.isLost) {
            return await handleSightingCreation(t, data);
          }
        },
      },
    ],
    [
      t,
      onPhotoAnalyze,
      uploadMultiplePetImages,
      aiPhotoAnalysisAllowed,
      isAiFeatureEnabled,
    ],
  );

  return (
    <SightingWizard
      config={config}
      initialData={initialData}
      onFinish={() => router.back()}
      onCancel={() => router.back()}
    />
  );
}
