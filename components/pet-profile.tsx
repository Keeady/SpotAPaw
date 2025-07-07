import React from "react";
import { Image, View } from "react-native";
import { Card, Divider, Text } from "react-native-paper";

export function RenderPetProfile(data) {
  const pet = data.pet;

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

export function RenderShortProfile(data) {
  const pet = data.pet;
  return (
    <Card style={{borderRadius: 20, margin: 5, marginBottom: 20, backgroundColor: "#fff"}}>
      {pet.photo ? (
        <Image
          source={{ uri: pet.photo }}
          resizeMode="cover"
          style={{
            width: "100%",
            height: 300,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
          }}
        />
      ): (
        <View  style={{
            width: "100%",
            height: 300,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#ddd"
          }}>
          <Text>No photo</Text>
        </View>
      )}
      <Card.Content style={{alignItems: "center",}}>
        <Text variant="headlineLarge">{pet.name}</Text>
        <Divider />
        <Text variant="bodyLarge">{pet.breed}</Text>
        <Text variant="bodyLarge">{pet.age} years old</Text>
      </Card.Content>
    </Card>
  );
}
