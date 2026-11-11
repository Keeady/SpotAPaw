import { useUploadMultiplePetImage } from "@/components/image-upload-handler";
import { SightingWizard } from "@/components/wizard2.0/wizard";
import { PET_FIELDS_CLEARED } from "@/components/wizard2.0/wizard-constants";
import { WizardConfig } from "@/components/wizard2.0/wizard-types";
import { PetRepository } from "@/db/repositories/pet-repository";
import { SightingRepository } from "@/db/repositories/sighting-repository";
import handlePetImageUpload from "@/lib/pet-service/pet-image-upload";
import handlePetUpdate from "@/lib/pet-service/pet-update-handler";
import handlePhotoUploadAnalyze from "@/lib/photo-analysis/photo-upload-handler";
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
  const { uploadMultiplePetImages } = useUploadMultiplePetImage();

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
        nextActionName: () => t("continue", "Continue"),
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
        nextActionName: () => t("continue", "Continue"),
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
        nextActionName: () => t("continue", "Continue"),
        onComplete: async (data) => {
          if (data.images && data.id) {
            return await handlePhotoUploadAnalyze(
              onPhotoAnalyze,
              data.images,
              data.id,
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
        nextActionName: (data) =>
          data.isLost
            ? t("continue", "Continue")
            : t("updatePet", "Update Pet"),
        onComplete: async (data) => {
          if (data.id) {
            await handlePetUpdate(t, data.id, data);
            if (data.images) {
              await handlePetImageUpload(
                t,
                uploadMultiplePetImages,
                data,
                data.id,
                data.images,
              );
            }

            return {
              ...data,
              lastSeenLat: undefined,
              lastSeenLong: undefined,
            };
          }
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
        onComplete: async (data) => {},
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
          // TODO
          if (data && data.isLost) {
            try {
              const sightingRepository = new SightingRepository();
              await sightingRepository.createSighting({ ...data });
            } catch {}
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
