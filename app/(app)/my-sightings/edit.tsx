import { AuthContext } from "@/components/Provider/auth-provider";
import { supabase } from "@/components/supabase-client";
import { Pet } from "@/model/pet";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { showMessage } from "react-native-flash-message";
import EditPetSightingDetails from "@/components/sightings/sighting-edit";
import useUploadPetImageUrl from "@/components/image-upload";
import { PetSighting } from "@/model/sighting";
import { isValidUuid } from "@/components/util";

export default function EditPetSighting() {
  const { sightingId, petId } = useLocalSearchParams<{
    sightingId: string;
    petId: string;
  }>();
  const [pet, setPet] = useState<Pet | undefined>();
  const { user } = useContext(AuthContext);
  const [profileInfo, setProfileInfo] = useState<Pet>();
  const [sightingInfo, setSightingInfo] = useState<PetSighting>();

  const router = useRouter();
  const [sighting, setSighting] = useState();
  const uploadImage = useUploadPetImageUrl();

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
        setProfileInfo(data);
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
        setSightingInfo(data);
      });
  }, [sightingId]);

  const handleSubmit = async (photoUrl: string) => {
    if (!profileInfo || !user || !sightingInfo) {
      return;
    }

    if (!isValidUuid(petId) || !isValidUuid(sightingId)) {
      return;
    }

    const { error } = await supabase
      .from("sightings")
      .update({
        name: profileInfo.name,
        species: profileInfo.species,
        breed: profileInfo.breed,
        gender: profileInfo.gender,
        colors: profileInfo.colors,
        features: profileInfo.features,
        photo: photoUrl,
        reporter_id: user?.id,
        last_seen_time: sightingInfo.last_seen_time || new Date().toISOString(),
        last_seen_location: sightingInfo.last_seen_location,
        last_seen_lat: sightingInfo?.last_seen_lat,
        last_seen_long: sightingInfo.last_seen_long,
        pet_id: petId,
        id: sightingId,
        note: profileInfo.note,
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
      router.replace(`/my-sightings`);
    }
  };

  async function saveSightingPhoto() {
    if (!profileInfo || !user || !sightingInfo) {
      return;
    }
    if (profileInfo.photo) {
      await uploadImage(profileInfo.photo, handleSubmit);
    } else {
      await handleSubmit("");
    }
  }

  return EditPetSightingDetails(
    saveSightingPhoto,
    setProfileInfo,
    setSightingInfo,
    pet,
    sighting,
    true
  );
}
