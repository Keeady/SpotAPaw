import { useUploadMultiplePetImage } from "@/components/image-upload-handler";
import { useAIFeatureContext } from "@/components/Provider/ai-context-provider";
import { useProContext } from "@/components/Provider/pro-context-provider";
import { SightingWizard } from "@/components/wizard2.0/wizard";
import { PET_FIELDS_CLEARED } from "@/components/wizard2.0/wizard-constants";
import { WizardConfig } from "@/components/wizard2.0/wizard-types";
import { PetRepository } from "@/db/repositories/pet-repository";
import { SightingRepository } from "@/db/repositories/sighting-repository";
import handlePhotoUploadAnalyze from "@/lib/photo-analysis/photo-upload-handler";
import usePhotoAnalyzeStep from "@/lib/photo-analysis/use-photo-analyze";
import handleSightingCreation from "@/lib/sighting-service/sighting-create-handler";
import handleSightingImageUpload from "@/lib/sighting-service/sighting-image-upload";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

export default function MyNewSighting() {
  const {
    id: sightingId,
    petId,
    is_lost: isPetLost,
    linkedSightingId,
  } = useLocalSearchParams<{
    id: string;
    petId: string;
    is_lost: string;
    linkedSightingId: string;
  }>();

  const { t } = useTranslation("wizard");
  const router = useRouter();
  const onPhotoAnalyze = usePhotoAnalyzeStep();
  const { uploadMultiplePetImages } = useUploadMultiplePetImage();
  const { aiPhotoAnalysisAllowed } = useProContext();
  const { isAiFeatureEnabled } = useAIFeatureContext();

  const [initialData, setInitialData] = useState({
    ...PET_FIELDS_CLEARED,
    reportType: undefined,
    isLost: true,
    id: petId,
    sightingId,
  });

  useEffect(() => {
    if (!sightingId) {
      return;
    }

    const repository = new SightingRepository();
    repository.getSighting(sightingId).then((data) => {
      if (data) {
        setInitialData((prev) => ({
          ...prev,
          ...data,
          sightingId
        }));
      }
    });
  }, [sightingId]);

  useEffect(() => {
    if (!petId) {
      return;
    }
    const petRepository = new PetRepository();
    petRepository
      .getPet(petId)
      .then((data) => {
        if (data) {
          setInitialData((prev) => ({ ...prev, ...data, petId }));
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
        nextActionName: () => t("continue", "Continue"),
        skip: (data) => !!data.sightingId,
        onComplete: () => undefined,
      },
      {
        id: "choose_pet",
        title: t("selectAPetProfile", "Select a pet profile"),
        subtitle: t(
          "sorryToHearYourPetIsMissing",
          "Sorry to hear your pet is missing. Let's bring them back!",
        ),
        nextActionName: () => t("continue", "Continue"),
        onComplete: () => undefined,
        skip: (data) => data.reportType === "found_stray" || !!data.petId,
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
            return await handlePhotoUploadAnalyze(
              onPhotoAnalyze,
              data.images,
              data.petId ?? null,
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
            let newData = data;
            // upload images
            if (data.images && data.images.length > 0) {
              newData = await handleSightingImageUpload(
                t,
                uploadMultiplePetImages,
                data,
                null,
                data.images,
              );
            }

            await handleSightingCreation(t, newData);
          }
        },
      },
    ],
    [
      t,
      onPhotoAnalyze,
      uploadMultiplePetImages,
      isAiFeatureEnabled,
      aiPhotoAnalysisAllowed,
    ],
  );

  return (
    <SightingWizard
      initialData={initialData}
      config={config}
      onFinish={() => router.back()}
      onCancel={() => router.back()}
    />
  );
}
