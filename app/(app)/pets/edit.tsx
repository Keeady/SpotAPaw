import EditPetDetails from "@/components/pets/pet-edit";
import { AuthContext } from "@/components/Provider/auth-provider";
import { supabase } from "@/components/supabase-client";
import { Pet } from "@/model/pet";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import * as Location from "expo-location";
import { showMessage } from "react-native-flash-message";

export default function editPet() {
  const { id, is_lost } = useLocalSearchParams();
  const [pet, setPet] = useState<Pet | undefined>();
  const { user } = useContext(AuthContext);
  const [profileInfo, setProfileInfo] = useState<Pet>();
  const router = useRouter();
  const [last_seen_location, setLastSeenLocation] = useState("");
  const [coords, setLastSeenCoords] = useState<Location.LocationObjectCoords>();
  const [last_seen_time, setLastSeenTime] = useState("");
/*
  useEffect(() => {
    console.log("last_seen_location", last_seen_location)
    console.log("last_seen_time", last_seen_time)
    console.log("coords", coords)
    if (last_seen_location) {
      setProfileInfo((prev) => ({
        ...prev,
        [last_seen_location]: last_seen_location,
      }));
    }

    if (last_seen_time) {

      setProfileInfo((prev) => ({ ...prev, [last_seen_time]: last_seen_time }));
    }
  }, [last_seen_location, last_seen_time, setProfileInfo]);*/

  useEffect(() => {
    if (!id) {
      return;
    }

    supabase
      .from("pets")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data, error }) => {
        setPet(data);
        setProfileInfo(data);
      });
  }, [id]);

  const handleSubmit = async () => {
    if (!profileInfo || !user) {
      return;
    }

    const { data, error } = await supabase
      .from("pets")
      .update({
        name: profileInfo.name,
        species: profileInfo.species,
        breed: profileInfo.breed,
        age: profileInfo.age,
        gender: profileInfo.gender,
        colors: profileInfo.colors,
        features: profileInfo.features,
        photo: profileInfo.photo,
        owner_id: user?.id,
        is_lost: !!is_lost,
        last_seen_time: profileInfo.last_seen_time || new Date().toISOString(),
        last_seen_location: profileInfo.last_seen_location,
        last_seen_lat: profileInfo?.last_seen_lat,
        last_seen_long: profileInfo.last_seen_long,
      })
      .eq("id", id)
      .select();

    if (error) {
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
      if (is_lost) {
        await handleLostPet();
        //router.navigate(`/(app)/owner`);
      } else {
      router.replace(`/(app)/pets/${id}`);

      }
    }
  };

  const handleLostPet = async () => {
    if (!profileInfo || !user) {
      return;
    }

    const { data, error } = await supabase
      .from("sightings")
      .insert({
        name: profileInfo.name,
        species: profileInfo.species,
        breed: profileInfo.breed,
        gender: profileInfo.gender,
        colors: profileInfo.colors,
        features: profileInfo.features,
        photo: profileInfo.photo,
        reporter_id: user?.id,
        last_seen_time: profileInfo.last_seen_time || new Date().toISOString(),
        last_seen_location: profileInfo.last_seen_location,
        last_seen_lat: profileInfo?.last_seen_lat,
        last_seen_long: profileInfo.last_seen_long,
        pet_id: id
      })
      .select();

    if (error) {
            console.log("errpr", error)

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
      if (is_lost) {
        router.navigate(`/(app)/owner`);
      } else {
      router.replace(`/(app)/pets/${id}`);

      }
    }
  }

  return EditPetDetails(
    handleSubmit,
    setProfileInfo,
    setLastSeenLocation,
    setLastSeenCoords,
    setLastSeenTime,
    profileInfo,
    !!is_lost
  );
}
