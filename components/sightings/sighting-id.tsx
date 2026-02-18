import { useRouter, useLocalSearchParams } from "expo-router";
import { useCallback, useContext, useEffect, useState } from "react";
import { showMessage } from "react-native-flash-message";
import SightingDetail from "@/components/sightings/sighting-details";
import { usePetSightings } from "@/components/sightings/use-sighting-details";
import { AuthContext } from "@/components/Provider/auth-provider";
import { supabase } from "@/components/supabase-client";
import { useConfirmPetFound } from "../pets/pet-crud";
import { isValidUuid } from "../util";
import { log } from "../logs";

export default function SightingProfile() {
  const router = useRouter();

  const { id: sightingId, petId } = useLocalSearchParams<{
    id: string;
    petId: string;
  }>(); // pet id
  const [claimed, setClaimed] = useState(false);
  const [petOwner, setPetOwner] = useState();
  const [petName, setPetName] = useState("");

  const { loading, error, timeline, summary } = usePetSightings(
    petId,
    sightingId,
  );

  const { user } = useContext(AuthContext);
  const onPetFound = useConfirmPetFound();
  const sightingsRoute = user ? "my-sightings" : "sightings";

  useEffect(() => {
    if (user?.id && sightingId && isValidUuid(sightingId)) {
      supabase
        .from("pet_claims")
        .select("*")
        .eq("sighting_id", sightingId)
        .then(({ data }) => {
          if (data && data.length > 0) {
            setClaimed(true);
          }
        });
    }
  }, [user?.id, petId, sightingId]);

  useEffect(() => {
    if ((!summary?.name || !summary.owner_id) && petId && isValidUuid(petId)) {
      supabase
        .from("pets")
        .select("*")
        .eq("id", petId)
        .single()
        .then(({ data }) => {
          if (data) {
            setPetOwner(data.owner_id);
            setPetName(data.name);
          }
        });
    }
  }, [petId, summary?.name, summary?.owner_id]);

  const onAddSighting = useCallback(() => {
    router.push(`/${sightingsRoute}/new/?id=${sightingId}&petId=${petId}`);
  }, [sightingId, petId, router, sightingsRoute]);

  const onClaimPet = useCallback(() => {
    router.push(`/pets/claim/?petId=${petId}&sightingId=${sightingId}`);
  }, [sightingId, petId, router]);

  const onEdit = useCallback(() => {
    if (!petId) {
      return;
    }
    router.push(
      `/${sightingsRoute}/edit/?petId=${petId}&sightingId=${sightingId}`,
    );
  }, [petId, sightingId, router, sightingsRoute]);

  const handlePetFound = useCallback(() => {
    onPetFound(petName, petId);
  }, [petId, petName, onPetFound]);

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
    />
  );
}
