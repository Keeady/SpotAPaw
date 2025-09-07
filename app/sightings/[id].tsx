import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useContext, useEffect, useState } from "react";
import { showMessage } from "react-native-flash-message";
import SightingDetail from "@/components/sightings/sighting-details";
import { usePetSightings } from "@/components/sightings/use-sighting-details";
import { AuthContext } from "@/components/Provider/auth-provider";
import { supabase } from "@/components/supabase-client";

export default function SightingProfile() {
  const { id: sightingId, petId } = useLocalSearchParams(); // pet id
  console.log("Petid: ", petId, "Sighting: ", sightingId);
  const [claimed, setClaimed] = useState(false);
  const [petOwner, setPetOwner] = useState();

  const { loading, error, timeline, summary } = usePetSightings(petId, sightingId);

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
  }, [user?.id, petId]);

  useEffect(() => {
    if (user && petId) {
      supabase
        .from("pets")
        .select("*")
        .eq("pet_id", petId)
        .single()
        .then(({ data }) => {
          console.log("pet by id", data)
          if (data) {
            setPetOwner(data.owner_id)
          }
        });
    }
  }, [petId, user?.id])

  const onAddSighting = useCallback(() => {
    router.navigate(`/sightings/new/?id=${sightingId}&petId=${petId}`);
  }, [summary]);

  const onClaimPet = useCallback(() => {
    console.log("This pet is mine");
    router.navigate(`/pets/claim/?petId=${petId}&sightingId=${sightingId}`);
  }, [summary]);

  const onEdit = useCallback(() => {
    if (!petId) {
      return;
    }
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

  if (!timeline || timeline.length === 0 || loading) {
    return null;
  }

  console.log("timeline", timeline)
  return (
    <SightingDetail
      sightings={timeline}
      petSummary={summary}
      onAddSighting={onAddSighting}
      onEdit={user && user?.id === petOwner ? onEdit : undefined}
      claimPet={user && !petOwner ? onClaimPet : undefined}
      claimed={claimed}
      hasOwner={!!petOwner}
    />
  );
}
