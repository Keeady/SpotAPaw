import EditPetDetails from "@/components/pets/pet-edit";
import { AuthContext } from "@/components/Provider/auth-provider";
import { supabase } from "@/components/supabase-client";
import { Pet } from "@/model/pet";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { showMessage } from "react-native-flash-message";
import useUploadPetImageUrl from "@/components/image-upload";
import { isValidUuid } from "@/components/util";

export default function EditPet() {
  const { id, is_lost } = useLocalSearchParams<{
    id: string;
    is_lost: string;
  }>();
  const { user } = useContext(AuthContext);
  const [profileInfo, setProfileInfo] = useState<Pet>();
  const router = useRouter();
  const uploadImage = useUploadPetImageUrl();
  const isLost = Boolean(is_lost);

  useEffect(() => {
    if (!id || !isValidUuid(id)) {
      return;
    }

    supabase
      .from("pets")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data, error }) => {
        console.log("error", error);
        setProfileInfo(data);
      });
  }, [id]);

  const handleSubmit = async (photoUrl: string) => {
    if (!profileInfo || !user) {
      return;
    }

    const { error } = await supabase
      .from("pets")
      .update({
        name: profileInfo.name,
        species: profileInfo.species,
        breed: profileInfo.breed,
        age: profileInfo.age,
        gender: profileInfo.gender,
        colors: profileInfo.colors,
        features: profileInfo.features,
        photo: photoUrl,
        note: profileInfo.note,
        owner_id: user?.id,
        is_lost: isLost,
      })
      .eq("id", id)
      .select();

    if (error) {
      console.log(error);
      showMessage({
        message: "Error updating pet profile.",
        type: "warning",
        icon: "warning",
      });
    } else {
      showMessage({
        message: "Successfully updated pet profile.",
        type: "success",
        icon: "success",
      });
      if (isLost) {
        handleLostPet(photoUrl);
      } else {
        router.replace(`/(app)/pets`);
      }
    }
  };

  async function savePetInfo() {
    if (!profileInfo || !user) {
      return;
    }
    if (profileInfo.photo) {
      await uploadImage(profileInfo.photo, handleSubmit);
    } else {
      await handleSubmit("");
    }
  }

  const handleLostPet = async (photoUrl: string) => {
    if (!profileInfo || !user) {
      return;
    }

    const { error } = await supabase
      .from("sightings")
      .insert({
        name: profileInfo.name,
        species: profileInfo.species,
        breed: profileInfo.breed,
        gender: profileInfo.gender,
        colors: profileInfo.colors,
        features: profileInfo.features,
        photo: photoUrl,
        note: profileInfo.note,
        reporter_id: user?.id,
        last_seen_time: profileInfo.last_seen_time || new Date().toISOString(),
        last_seen_location: profileInfo.last_seen_location,
        last_seen_lat: profileInfo?.last_seen_lat,
        last_seen_long: profileInfo.last_seen_long,
        pet_id: id,
      })
      .select();

    if (error) {
      console.log("error", error);

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
      if (isLost) {
        router.replace(`/(app)/pets`);
      } else {
        router.replace(`/(app)/pets`);
      }
    }
  };

  return EditPetDetails(savePetInfo, setProfileInfo, profileInfo, !!isLost);
}
