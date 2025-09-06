import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useContext, useEffect, useState } from "react";
import { showMessage } from "react-native-flash-message";
import SightingDetail from "@/components/sightings/sighting-details";
import { usePetSightings } from "@/components/sightings/use-sighting-details";
import { AuthContext } from "@/components/Provider/auth-provider";
import { supabase } from "@/components/supabase-client";

export default function SightingProfile() {
  const { id: petId } = useLocalSearchParams(); // pet id
  console.log("Pet ", petId);
  const [claimed, setClaimed] = useState(false);

  const { loading, error, timeline, summary, sightingPetOwner } = usePetSightings(petId);

  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      supabase
        .from("pet_claims")
        .select("*")
        .eq("sighting_pet_id", petId)
        .then(({ data }) => {
          if (data && data.length > 0) {
            setClaimed(true)
          }
        });
    }
  }, [user?.id]);

  const onAddSighting = useCallback(() => {
    router.navigate(`/sightings/new/?id=${summary?.id}&petId=${petId}`);
  }, [summary]);

  const onClaimPet = useCallback(() => {
    console.log("This pet is mine");
    router.navigate(`/pets/claim/?petId=${petId}&sightingId=${summary?.id}`);
  }, [summary]);

  const onEdit = useCallback(() => {
    router.navigate(`/pets/${petId}`);
  }, []);

  if (error) {
    showMessage({
      message: "Error fetching sighting info. Please try again.",
      type: "warning",
      icon: "warning",
    });
    return;
  }

  console.log("sightingPetOwner", sightingPetOwner);

  if (!timeline || timeline.length === 0 || loading) {
    return null;
  }

  return (
    <SightingDetail
      sightings={timeline}
      petSummary={summary}
      onAddSighting={onAddSighting}
      onEdit={user?.id === sightingPetOwner?.owner_id ? onEdit : undefined}
      claimPet={user && !sightingPetOwner?.owner_id ? onClaimPet : undefined}
      claimed={claimed}
      hasOwner={!!sightingPetOwner?.owner_id}
    />
  );
}
