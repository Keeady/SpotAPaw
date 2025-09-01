import PetDetails from "@/components/pets/pet-details";
import { supabase } from "@/components/supabase-client";
import { Pet } from "@/model/pet";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { showMessage } from "react-native-flash-message";
import { AuthContext } from "@/components/Provider/auth-provider";

export default function PetProfile() {
  const { id } = useLocalSearchParams();
  const [pet, setPet] = useState<Pet | undefined>(undefined);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    setLoading(true);
    supabase
      .from("pets")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        setLoading(false);
        setPet(data);
      });
  }, [id]);
  if (loading) {
    return <Text>Loading ...</Text>;
  }

  async function deletePet() {
    if (id || !user) {
      return;
    }

    const { error } = await supabase
      .from("pets")
      .delete()
      .eq("id", id)
      .eq("owner_id", user.id)
      .select();

    if (error) {
      showMessage({
        message: "Error deleting pet profile.",
        type: "warning",
        icon: "warning",
      });
    } else {
      showMessage({
        message: "Successfully deleted pet profile.",
        type: "success",
        icon: "success",
      });
      router.replace(`/(app)/pets`);
    }
  }

  function onEdit() {
    router.navigate(`/(app)/pets/edit?id=${id}`);
  }

  function onPetLost() {
    router.navigate(`/(app)/pets/edit?id=${id}&is_lost=true`);
  }

  async function onPetFound() {
    const {data, error } = await supabase
      .from("pets")
      .update({
        is_lost: false,
        last_seen_time: null,
        last_seen_long: null,
        last_seen_lat: null,
        last_seen_location: null
      })
      .eq("id", id);

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
    }
    router.replace(`/(app)/pets/${id}`);
  }

  if (!pet) {
    return (
      <View>
        <Button onPress={() => router.navigate("/(app)/pets/new")}>
          Add Pet
        </Button>
      </View>
    );
  }

  return PetDetails(pet, deletePet, onEdit, onPetLost, onPetFound);
}
