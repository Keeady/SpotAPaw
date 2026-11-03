import { SightingWizard } from "@/components/wizard2.0/wizard";
import { WizardConfig } from "@/components/wizard2.0/wizard-types";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export default function EditPetSighting() {
  const { t } = useTranslation("wizard");
  const router = useRouter();

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
        skip: () => true
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
        skip: () => true
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
          // Optional: run AI analysis and return the fields to merge, e.g.
          // const analysis = await analyzePhoto(data.images?.[0]);
          // return { breed: analysis.breed, colors: analysis.colors };
          // Throwing here keeps the user on the step and shows the message.
          // await sightingRepository.create(data);
        },
      },
            {
        id: "edit_pet",
        title: t("whatDidThePetLookLike", "What did the pet look like?"),
        subtitle: t("reviewAndEditPetDescription", "Review and edit pet description"),
        nextActionName: t("continue", "Continue"),
        onComplete: () => undefined,
      },
      {
        id: "edit_pet_continued",
        title: t("whatDidThePetLookLikeCont", "What did the pet look like? (Cont.)"),
        subtitle: t("reviewAndEditPetDescription", "Review and edit pet description"),
        nextActionName: t("submitReport", "Submit report"),
        onComplete: async (data) => {
          // Last step: save here. Throwing shows the error and keeps the user on the step.
          // await sightingRepository.create(data);
        },
      },
            {
        id: "last_seen",
        title: t("whenAndWhereWasThePetLastSeen", "When and where was the pet last seen?"),
        subtitle: t(
          "selectADateAndTimeThenPlaceAPin",
          "Select a date and time, then place a pin on the map.",
        ),
        nextActionName: t("continue", "Continue"),
        onComplete: () => undefined,
      },
      {
        id: "add_contact",
        title: t("updateYourContactInfo", "Update your contact info."),
        subtitle: t("reviewAndEditYourContactInfo", "Review and edit your contact info."),
        nextActionName: t("submitReport", "Submit report"),
        onComplete: async (data) => {
          // Last step: save here. Throwing shows the error and keeps the user on the step.
          // await sightingRepository.create(data);
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
