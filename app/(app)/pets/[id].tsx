import { AuthContext } from "@/components/Provider/auth-provider";
import { log } from "@/components/logs";
import {
  onEditPet,
  onPetLost,
  useConfirmDelete,
  useConfirmPetFound,
  viewPetSightings,
} from "@/components/pets/pet-crud";
import RenderPetDetails from "@/components/pets/pet-details";
import { SightingPet } from "@/components/wizard/wizard-interface";
import { AggregatedSighting } from "@/db/models/sighting";
import { PetRepository } from "@/db/repositories/pet-repository";
import { RepositoryException } from "@/db/repositories/repository.interface";
import { SightingRepository } from "@/db/repositories/sighting-repository";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { View } from "react-native";
import { showMessage } from "react-native-flash-message";
import { Button, Text } from "react-native-paper";

export default function PetProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [pet, setPet] = useState<SightingPet | undefined>(undefined);
  const [sighting, setSighting] = useState<AggregatedSighting | undefined>(
    undefined,
  );
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);
  const onConfirmDelete = useConfirmDelete();
  const onPetFound = useConfirmPetFound();

  useEffect(() => {
    setLoading(true);
    const petRepository = new PetRepository();
    petRepository
      .getPet(id)
      .then((data) => {
        setPet(data);
      })
      .catch((error: RepositoryException) => {
        log(`getPet: Error fetching pet profile ${error.message}`);
        showMessage({
          message: "Error fetch pet profile.",
          type: "warning",
          icon: "warning",
          statusBarHeight: 50,
        });
      })
      .finally(() => setLoading(false));

    const sightingRepository = new SightingRepository();
    sightingRepository
      .getSightingsByPetId(id)
      .then((data) => {
        if (data.length > 0) {
          setSighting(data[0]);
        }
      })
      .catch((error: RepositoryException) => {
        log(`getSightingsByPetId: Error fetching sightings ${error.message}`);
      });
  }, [id]);

  if (!user) {
    return null;
  }

  if (loading) {
    return <Text>Loading ...</Text>;
  }

  if (!pet) {
    return (
      <View>
        <Button onPress={() => router.navigate("/(app)/pets/new")}>
          Add Pet
        </Button>
      </View>
    );
  }

  return (
    <RenderPetDetails
      pet={pet}
      onDeletePet={() => onConfirmDelete(pet.name, pet.id, user.id)}
      onEditPet={() =>
        onEditPet(pet.id, sighting ? sighting.linkedSightingId : undefined)
      }
      onPetLost={() => onPetLost(pet.id)}
      onPetFound={() => onPetFound(pet.name, pet.id)}
      viewPetSightings={() =>
        viewPetSightings(sighting ? sighting.linkedSightingId : "")
      }
    />
  );
}
