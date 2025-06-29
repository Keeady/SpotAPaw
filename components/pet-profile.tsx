import React, { useContext, useEffect, useState } from "react";
import { Alert, Image } from "react-native";
import { Card, Divider, Text } from "react-native-paper";
import { AuthContext } from "./Provider/auth-provider";
import { supabase } from "./supabase-client";

export default function PetProfile() {
  const auth = useContext(AuthContext);
  const user = auth.user;
    const [loading, setLoading] = useState(true)
  const [pet, setPet] = useState();

  /*const pet = {
    photo: "https://placedog.net/500",
    name: "Luna",
    species: "Dog",
    breed: "Unknown",
    gender: "Female",
    colors: "Golden",
    features: "Small scar above left eye",
    age: 4,
  };*/

  async function getProfile() {
    try {
      setLoading(true)
      if (!user) throw new Error("No user on the session!");
      console.log("user", user.id)
      const { data, error, status } = await supabase
        .from("pets")
        .select(`*`)
        ;
        console.log("error", error)
        console.log("status", status)
      if (error && status !== 406) {
        console.log("Error", error)
        throw error;
      }
      if (data) { // plural pets
        console.log("pet", data);
        setPet(data[0])
      }
    } catch (error) {
      console.log("error", error)
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) getProfile()
  }, [user?.id]);

  if (!pet) {
    return;
  }

  return (
    <Card>
      {pet.photo && (
        <Image
          source={{ uri: pet.photo }}
          resizeMode="cover"
          style={{
            //width: 200,
            height: 200,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
          }}
        />
      )}
      <Card.Content>
        <Text variant="headlineLarge">{pet.name}</Text>
        <Divider />
        <Text variant="bodyLarge">
          <Text variant="labelLarge">Species: </Text> {pet.species}
        </Text>
        <Text variant="bodyLarge">
          <Text variant="labelLarge">Breed: </Text> {pet.breed}
        </Text>
        <Text variant="bodyLarge">
          <Text variant="labelLarge">Age: </Text> {pet.age}
        </Text>
        <Text variant="bodyLarge">
          <Text variant="labelLarge">Gender: </Text> {pet.gender}
        </Text>
        <Text variant="bodyLarge">
          <Text variant="labelLarge">Colors: </Text> {pet.colors}
        </Text>
        <Text variant="bodyLarge">
          <Text variant="labelLarge">Distinctive Features: </Text>{" "}
          {pet.features}
        </Text>
      </Card.Content>
    </Card>
  );
}
