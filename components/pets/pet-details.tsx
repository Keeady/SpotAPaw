import { Button, Card, Divider, Text } from "react-native-paper";
import { Alert, Image, StyleSheet, View } from "react-native";
import { Pet } from "@/model/pet";
import PetProfileCard from "./profile";
import { User } from "@supabase/supabase-js";
import { useCallback, useContext } from "react";
import { AuthContext } from "../Provider/auth-provider";

type RenderPetDetailsProps = {
  pet: Pet;
  onDeletePet: () => void;
  onEditPet: () => void;
  onPetLost: () => void;
  onPetFound: () => void;
};

export default function RenderPetDetails({
  pet,
  onDeletePet,
  onEditPet,
  onPetFound,
  onPetLost,
}: RenderPetDetailsProps) {
    const {user} = useContext(AuthContext);

  if (!pet) {
    return <Text>No pet details found</Text>;
  }

  return (
    <PetProfileCard
      petProfile={{ ...pet, status: pet.is_lost ? "lost" : "safe" }}
      onEditPet={onEditPet}
      onPetFound={onPetFound}
      onPetLost={onPetLost}
      onDeletePet={onDeletePet}
    />
  );
}
