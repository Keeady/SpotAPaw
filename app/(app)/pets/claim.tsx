import { AuthContext } from "@/components/Provider/auth-provider";
import ClaimSighting from "@/components/sightings/sighting-claim";
import { supabase } from "@/components/supabase-client";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useContext, useEffect, useState } from "react";
import { showMessage } from "react-native-flash-message";

export default function ClaimLostPet() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const [pets, setPets] = useState([]);
  const [sighting, setSighting] = useState();
  const [loadingPet, setLoadingPet] = useState(false);
  const [loadingSighting, setLoadingSighting] = useState(false);

  const { petId, sightingId } = useLocalSearchParams();

  useEffect(() => {
    setLoadingPet(true);
    supabase
      .from("pets")
      .select("*")
      .eq("owner_id", user?.id)
      .then(({ data, error }) => {
        setPets(data);
        setLoadingPet(false)
      });
  }, [user?.id]);

  useEffect(() => {
    setLoadingSighting(true)
    supabase
      .from("sightings")
      .select("*")
      .eq("id", sightingId)
      .single()
      .then(({ data, error }) => {
        setSighting(data);
        setLoadingSighting(false)
      });
  }, [petId, sightingId]);

  const onConfirm = useCallback(
    async (selectedPetId: string) => {
      const { data, error } = await supabase
        .from("pet_claims")
        .insert([
          {
            pet_id: selectedPetId,
            sighting_id: sightingId,
            owner_id: user?.id,
          },
        ])
        .select();

      if (error) {
        showMessage({
          message: "Error updating pet sighting.",
          type: "warning",
          icon: "warning",
        });
        return;
      } else {
        showMessage({
          message: "Successfully submitted Claim.",
          type: "success",
          icon: "success",
        });
        router.navigate(`/(app)/my-sightings`);
      }
    },
    [user?.id]
  );

  if (loadingPet || loadingSighting || !sighting) {
    return null;
  }
  return <ClaimSighting sighting={sighting} pets={pets} onConfirm={onConfirm} />;
}
