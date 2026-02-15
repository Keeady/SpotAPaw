import { Pet } from "@/model/pet";
import { Card, RadioButton } from "react-native-paper";
import { StyleSheet, Image } from "react-native";

type PetSelectionProps = {
  setSelectedPetId: (value: string) => void;
  selectedPetId: string;
  pets: Pet[];
};

export function PetSelection({
  setSelectedPetId,
  selectedPetId,
  pets,
}: PetSelectionProps) {
  return (
    <RadioButton.Group
      onValueChange={(value) => setSelectedPetId(value)}
      value={selectedPetId}
    >
      {pets.map((pet) => (
        <PetThumbnail
          key={pet.id}
          setSelectedPetId={setSelectedPetId}
          selectedPetId={selectedPetId}
          petId={pet.id}
          petName={pet.name}
          petGender={pet.gender}
          petAge={pet.age}
          petPhoto={pet.photo}
        />
      ))}
    </RadioButton.Group>
  );
}

type PetThumbnailProps = {
  setSelectedPetId: (value: string) => void;
  selectedPetId: string;
  petId: string;
  petName: string;
  petGender: string;
  petAge: string;
  petPhoto: string;
};

export function PetThumbnail({
  setSelectedPetId,
  selectedPetId,
  petId,
  petName,
  petGender,
  petAge,
  petPhoto,
}: PetThumbnailProps) {
  return (
    <Card
      key={petId}
      style={[
        styles.petCard,
        selectedPetId === petId && styles.petCardSelected,
      ]}
      onPress={() => setSelectedPetId(petId)}
    >
      <Card.Title
        title={petName}
        subtitle={`${petGender}, ${petAge} years`}
        left={(props) =>
          petPhoto ? (
            <Image source={{ uri: petPhoto }} style={styles.petImage} />
          ) : null
        }
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  petCard: {
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  petCardSelected: {
    borderColor: "#007bff",
    borderWidth: 2,
  },
  petImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});
