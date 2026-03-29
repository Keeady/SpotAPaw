import { log } from "@/components/logs";
import { AuthContext } from "@/components/Provider/auth-provider";
import ClaimSighting from "@/components/sightings/sighting-claim";
import { createErrorLogMessage, isValidUuid } from "@/components/util";
import { SightingPet } from "@/components/wizard/wizard-interface";
import { AggregatedSighting } from "@/db/models/sighting";
import { ClaimRepository } from "@/db/repositories/claim-repository";
import { PetRepository } from "@/db/repositories/pet-repository";
import { SightingRepository } from "@/db/repositories/sighting-repository";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useContext, useEffect, useState } from "react";
import { showMessage } from "react-native-flash-message";

export default function ClaimLostPet() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const [pets, setPets] = useState<SightingPet[]>([]);
  const [sighting, setSighting] = useState<AggregatedSighting>();
  const [loadingPet, setLoadingPet] = useState(false);
  const [loadingSighting, setLoadingSighting] = useState(false);

  const { petId, sightingId } = useLocalSearchParams<{
    petId: string;
    sightingId: string;
  }>();

  useEffect(() => {
    if (user?.id) {
      setLoadingPet(true);
      const petRepository = new PetRepository();
      petRepository
        .getPets(user.id)
        .then((data) => {
          if (data && data.length > 0) {
            setPets(data);
          }
        })
        .catch((error) => {
          const errorMessage = createErrorLogMessage(error);
          log(`getPets: Error fetching pet info for claim: ${errorMessage}`);

          showMessage({
            message: "Error fetching pet info.",
            type: "warning",
            icon: "warning",
            statusBarHeight: 50,
          });
        })
        .finally(() => {
          setLoadingPet(false);
        });
    }
  }, [user?.id]);

  useEffect(() => {
    setLoadingSighting(true);
    const sightingRepository = new SightingRepository();
    sightingRepository
      .getSighting(sightingId)
      .then((data) => {
        if (data) {
          setSighting(data);
        }
      })
      .catch((error) => {
        const errorMessage = createErrorLogMessage(error);
        log(
          `getSighting: Error fetching pet sighting for claim: ${errorMessage}`,
        );
        showMessage({
          message: "Error fetching pet sighting.",
          type: "warning",
          icon: "warning",
          statusBarHeight: 50,
        });
      })
      .finally(() => {
        setLoadingSighting(false);
      });
  }, [petId, sightingId]);

  const onConfirm = useCallback(
    async (selectedPetId: string) => {
      if (!isValidUuid(selectedPetId) || !isValidUuid(sightingId)) {
        return;
      }
      const repository = new ClaimRepository();
      repository
        .createClaim({
          petId: selectedPetId,
          sightingId: sightingId,
          ownerId: user?.id,
        })
        .then(() => {
          showMessage({
            message: "Successfully submitted Claim.",
            type: "success",
            icon: "success",
            statusBarHeight: 50,
          });
          router.replace(`/(app)/my-sightings`);
        })
        .catch((error) => {
          const errorMessage = createErrorLogMessage(error);
          log(`createClaim: Error submitting claim ${errorMessage}`);
          showMessage({
            message: "Error updating pet sighting.",
            type: "warning",
            icon: "warning",
            statusBarHeight: 50,
          });
          return;
        });
    },
    [user?.id, router, sightingId],
  );

  if (loadingPet || loadingSighting || !sighting) {
    return null;
  }
  return (
    <ClaimSighting sighting={sighting} pets={pets} onConfirm={onConfirm} />
  );
}
