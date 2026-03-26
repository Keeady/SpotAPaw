import { AuthContext } from "@/components/Provider/auth-provider";
import SightingDetail from "@/components/sightings/sighting-details";
import { usePetSightings } from "@/components/sightings/use-sighting-details";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useContext, useEffect, useState } from "react";
import { showMessage } from "react-native-flash-message";
import { log } from "../logs";
import { useConfirmPetFound } from "../pets/pet-crud";
import { isValidUuid } from "../util";
import { PetRepository } from "@/db/repositories/pet-repository";
import { ClaimRepository } from "@/db/repositories/claim-repository";
import { handleAddingSighting, handleSharingSighting } from "./sighting-handler";

export default function SightingProfile() {
  const router = useRouter();

  const { id: sightingId, petId } = useLocalSearchParams<{
    id: string;
    petId: string;
  }>(); // pet id
  const [claimed, setClaimed] = useState(false);
  const [petOwner, setPetOwner] = useState<string | undefined>();
  const [petName, setPetName] = useState("");

  const { loading, error, timeline, summary } = usePetSightings(sightingId);

  const { user } = useContext(AuthContext);
  const onPetFound = useConfirmPetFound();
  const sightingsRoute = user ? "my-sightings" : "sightings";

  useEffect(() => {
    if (user?.id && sightingId && isValidUuid(sightingId)) {
      const repository = new ClaimRepository();
      repository
        .getClaims(sightingId)
        .then((data) => {
          if (data && data.length > 0) {
            setClaimed(true);
          }
        })
        .catch(() => {});
    }
  }, [user?.id, petId, sightingId]);

  useEffect(() => {
    if ((!summary?.name || !summary.ownerId) && petId && isValidUuid(petId)) {
      const petRepository = new PetRepository();
      petRepository
        .getPet(petId)
        .then((data) => {
          if (data) {
            setPetOwner(data.ownerId);
            setPetName(data.name);
          }
        })
        .catch(() => {});
    }
  }, [petId, summary?.name, summary?.ownerId]);

  const onAddSighting = useCallback(() => {
    handleAddingSighting(router, sightingsRoute, sightingId, petId);
  }, [sightingId, petId, router, sightingsRoute]);

  const onClaimPet = useCallback(() => {
    router.push(`/pets/claim/?petId=${petId}&sightingId=${sightingId}`);
  }, [sightingId, petId, router]);

  const onEdit = useCallback(() => {
    if (!petId) {
      return;
    }
    router.push(`/${sightingsRoute}/edit/?petId=${petId}&id=${sightingId}`);
  }, [petId, sightingId, router, sightingsRoute]);

  const handlePetFound = useCallback(() => {
    onPetFound(petName, petId);
  }, [petId, petName, onPetFound]);

  const onShareSighting = useCallback(async () => {
    handleSharingSighting(sightingId, petName || summary?.name || "");
  }, [sightingId, petName, summary?.name]);

  if (error) {
    log(error);
    showMessage({
      message: "Error fetching sighting info. Please try again.",
      type: "warning",
      icon: "warning",
      statusBarHeight: 50,
    });
    return;
  }

  if (!timeline || timeline.length === 0 || loading || !summary) {
    return null;
  }

  const cleanedPetId = petId === "null" ? null : petId;
  const isOwner = user && user?.id === petOwner;

  return (
    <SightingDetail
      petName={petName}
      sightings={timeline}
      petSummary={summary}
      onAddSighting={onAddSighting}
      onEdit={isOwner ? onEdit : undefined}
      claimPet={user && !petOwner ? onClaimPet : undefined}
      claimed={claimed && !cleanedPetId}
      hasOwner={!!petOwner || !!cleanedPetId}
      isOwner={!!isOwner}
      onPetFound={isOwner ? handlePetFound : undefined}
      onShareSighting={onShareSighting}
    />
  );
}
