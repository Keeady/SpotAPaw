import { SightingWizard } from "@/components/wizard2.0/wizard";
import { WizardConfig } from "@/components/wizard2.0/wizard-types";
import { PetRepository } from "@/db/repositories/pet-repository";
import usePhotoAnalyzeStep from "@/lib/photo-analysis/use-photo-analyze";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export default function AddPet() {
  const { t } = useTranslation("wizard");
  const router = useRouter();
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
        nextActionName: t("continue", "Continue"),
        onComplete: (data) => console.log("start done:", data.reportType),
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
        onComplete: async (data) => {
          // e.g. await sightingRepository.create(data);
          console.log("pet chosen:", data.id);
        },
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
          console.log(data.images);
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
          if (data) {
            const petRepository = new PetRepository();
            const id = await petRepository.createPet(data);
            return {
              ...data,
              id,
            };
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
      config={config}
      onFinish={() => router.back()}
      onCancel={() => router.back()}
    />
  );
}
