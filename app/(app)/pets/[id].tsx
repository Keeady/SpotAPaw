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
import { createErrorLogMessage } from "@/components/util";
import { SightingPet } from "@/components/wizard/wizard-interface";
import { AggregatedSighting } from "@/db/models/sighting";
import { PetRepository } from "@/db/repositories/pet-repository";
import { SightingRepository } from "@/db/repositories/sighting-repository";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation(["petprofile", "translation"]);

  useEffect(() => {
    setLoading(true);
    const petRepository = new PetRepository();
    petRepository
      .getPet(id)
      .then((data) => {
        setPet(data);
      })
      .catch((error) => {
        const errorMessage = createErrorLogMessage(error);
        log(`getPet: Error fetching pet profile ${errorMessage}`);
        showMessage({
          message: t("errorFetchingPetProfile", "Error fetch pet profile."),
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
      .catch((error) => {
        const errorMessage = createErrorLogMessage(error);
        log(`getSightingsByPetId: Error fetching sightings ${errorMessage}`);
      });
  }, [id]);

  if (!user) {
    return null;
  }

  if (loading) {
    return <Text>{t("loading", "Loading ...")}</Text>;
  }

  if (!pet) {
    return (
      <View>
        <Button onPress={() => router.navigate("/(app)/pets/new")}>
          {t("addPet", "Add Pet")}
        </Button>
      </View>
    );
  }

  const sightingId = sighting ? sighting.id : "";
  const linkedSightingId = sighting ? sighting.linkedSightingId : "";
  const petId = pet ? pet.id : "";

  return (
    <RenderPetDetails
      pet={pet}
      onDeletePet={() => onConfirmDelete(pet.name, pet.id, user.id, t)}
      onEditPet={() => onEditPet(petId, sightingId)}
      onPetLost={() => onPetLost(pet.id)}
      onPetFound={() => onPetFound(pet.name, pet.id, t)}
      viewPetSightings={() =>
        viewPetSightings(sightingId, linkedSightingId, petId)
      }
    />
  );
}
