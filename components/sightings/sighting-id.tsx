import { useRouter, useLocalSearchParams } from "expo-router";
import { useCallback, useContext, useEffect, useState } from "react";
import { showMessage } from "react-native-flash-message";
import SightingDetail from "@/components/sightings/sighting-details";
import { usePetSightings } from "@/components/sightings/use-sighting-details";
import { AuthContext } from "@/components/Provider/auth-provider";
import { supabase } from "@/components/supabase-client";
import { onPetFound } from "../pets/pet-crud";
import { isValidUuid } from "../util";

export default function SightingProfile() {
  const router = useRouter();

  const { id: sightingId, petId } = useLocalSearchParams<{
    id: string;
    petId: string;
  }>(); // pet id
  const [claimed, setClaimed] = useState(false);
  const [petOwner, setPetOwner] = useState();

  const { loading, error, timeline, summary } = usePetSightings(
    petId,
    sightingId
  );

  const { user } = useContext(AuthContext);
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
    if (user?.id && petId && isValidUuid(petId)) {
      supabase
        .from("pets")
        .select("*")
        .eq("id", petId)
        .single()
        .then(({ data }) => {
          if (data) {
            setPetOwner(data.owner_id);
          }
        });
    }
  }, [petId, user?.id]);

  const onAddSighting = useCallback(() => {
    router.push(`/${sightingsRoute}/new/?id=${sightingId}&petId=${petId}`);
  }, [sightingId, petId, router, sightingsRoute]);

  const onChatSighting = useCallback(() => {
    router.push(`/${sightingsRoute}/chat-bot/?sightingId=${sightingId}&petId=${petId}`);
  }, [sightingId, petId, router, sightingsRoute]);

  const onClaimPet = useCallback(() => {
    router.push(`/pets/claim/?petId=${petId}&sightingId=${sightingId}`);
  }, [sightingId, petId, router]);

  const onEdit = useCallback(() => {
    if (!petId) {
      return;
    }
    router.push(
      `/${sightingsRoute}/edit/?petId=${petId}&sightingId=${sightingId}`
    );
  }, [petId, sightingId, router, sightingsRoute]);

  const handlePetFound = useCallback(() => {
    onPetFound(petId);
  }, [petId]);

  if (error) {
    showMessage({
      message: "Error fetching sighting info. Please try again.",
      type: "warning",
      icon: "warning",
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
      sightings={timeline}
      petSummary={summary}
      onAddSighting={onAddSighting}
      onChatSighting={onChatSighting}
      onEdit={isOwner ? onEdit : undefined}
      claimPet={user && !petOwner ? onClaimPet : undefined}
      claimed={claimed && !cleanedPetId}
      hasOwner={!!petOwner || !!cleanedPetId}
      isOwner={!!isOwner}
      onPetFound={isOwner ? handlePetFound : undefined}
    />
  );
}
