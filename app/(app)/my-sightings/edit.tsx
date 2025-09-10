import EditPetDetails from "@/components/pets/pet-edit";
import { AuthContext } from "@/components/Provider/auth-provider";
import { supabase } from "@/components/supabase-client";
import { Pet } from "@/model/pet";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import * as Location from "expo-location";
import { showMessage } from "react-native-flash-message";
import EditPetSightingDetails from "@/components/sightings/sighting-edit";

export default function editPetSighting() {
  const { sightingId, petId } = useLocalSearchParams();
  const [pet, setPet] = useState<Pet | undefined>();
  const { user } = useContext(AuthContext);
  const [profileInfo, setProfileInfo] = useState<Pet>();
  const [sightingInfo, setSightingInfo] = useState();

  const router = useRouter();
  const [sighting, setSighting] = useState();

  useEffect(() => {
    if (!petId) {
      return;
    }

    supabase
      .from("pets")
      .select("*")
      .eq("id", petId)
      .single()
      .then(({ data, error }) => {
        setPet(data);
        setProfileInfo(data)
      });
  }, [petId]);

  useEffect(() => {
    if (!sightingId) {
      return;
    }

    supabase
      .from("sightings")
      .select("*")
      .eq("id", sightingId)
      .single()
      .then(({ data, error }) => {
        setSighting(data);
        setSightingInfo(data)
      });
  }, [sightingId]);

  const handleSubmit = async () => {
    if (!profileInfo || !user || !sightingInfo) {
      return;
    }

    const { data, error } = await supabase
      .from("sightings")
      .update({
        name: profileInfo.name,
        species: profileInfo.species,
        breed: profileInfo.breed,
        gender: profileInfo.gender,
        colors: profileInfo.colors,
        features: profileInfo.features,
        photo: profileInfo.photo,
        reporter_id: user?.id,
        last_seen_time: sightingInfo.last_seen_time || new Date().toISOString(),
        last_seen_location: sightingInfo.last_seen_location,
        last_seen_lat: sightingInfo?.last_seen_lat,
        last_seen_long: sightingInfo.last_seen_long,
        pet_id: petId,
        id: sightingId,
        note: profileInfo.note
      })
      .eq("id", sightingId)
      .select();

    if (error) {
      showMessage({
        message: "Error updating pet sighting.",
        type: "warning",
        icon: "warning",
      });
    } else {
      showMessage({
        message: "Successfully updated pet sighting.",
        type: "success",
        icon: "success",
      });
      router.replace(`/my-sightings/${sightingId}/?petId=${petId}`);
    }
  };

  return EditPetSightingDetails(
    handleSubmit,
    setProfileInfo,
    setSightingInfo,
    pet,
    sighting,
     true
  );
}
