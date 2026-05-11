import { Text } from "react-native-paper";
import PetProfileCard from "./profile";
import { SightingPet } from "../wizard/wizard-interface";
import { useTranslation } from "react-i18next";

type RenderPetDetailsProps = {
  pet: SightingPet;
  onDeletePet: () => void;
  onEditPet: () => void;
  onPetLost: () => void;
  onPetFound: () => void;
  viewPetSightings: () => void;
};

export default function RenderPetDetails({
  pet,
  onDeletePet,
  onEditPet,
  onPetFound,
  onPetLost,
  viewPetSightings,
}: RenderPetDetailsProps) {
  const { t } = useTranslation("petprofile");
  if (!pet) {
    return <Text>{t("noPetDetailsFound", "No pet details found")}</Text>;
  }

  return (
    <PetProfileCard
      petProfile={{ ...pet, status: pet.isLost ? "lost" : "safe" }}
      onEditPet={onEditPet}
      onPetFound={onPetFound}
      onPetLost={onPetLost}
      onDeletePet={onDeletePet}
      viewPetSightings={viewPetSightings}
    />
  );
}
