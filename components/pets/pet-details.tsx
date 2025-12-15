import { Text } from "react-native-paper";
import { Pet } from "@/model/pet";
import PetProfileCard from "./profile";

type RenderPetDetailsProps = {
  pet: Pet;
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
  if (!pet) {
    return <Text>No pet details found</Text>;
  }

  return (
    <PetProfileCard
      petProfile={{ ...pet, status: pet.is_lost ? "lost" : "safe" }}
      onEditPet={onEditPet}
      onPetFound={onPetFound}
      onPetLost={onPetLost}
      onDeletePet={onDeletePet}
      viewPetSightings={viewPetSightings}
    />
  );
}
