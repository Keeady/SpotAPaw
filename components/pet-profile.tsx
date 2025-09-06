import { router } from "expo-router";
import React from "react";
import { Image, View } from "react-native";
import { Button, Card, Chip, Divider, Text } from "react-native-paper";

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

export function RenderSightingProfile(data) {
  const pet = data.pet;
  const reporter = pet.sighting_contact?.[0]?.name;
  const reporterPhone = pet.sighting_contact?.[0]?.phone;
  console.log("reporter", reporter, reporterPhone);
  return (
    <Card
      style={{
        borderRadius: 20,
        margin: 5,
        marginBottom: 20,
        backgroundColor: "#fff",
      }}
    >
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
      ) : (
        <View
          style={{
            width: "100%",
            height: 300,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#eee",
          }}
        >
          <Text>No photo</Text>
        </View>
      )}
      <Card.Content style={{ alignItems: "left" }}>
        <Chip
          style={{
            backgroundColor: pet?.name ? "#E6F7E6" : "#FFF4E5",
            marginTop: -20,
            marginBottom: 10,
            alignSelf: "flex-start",
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 12,
          }}
          textStyle={{
            color: pet?.name ? "#2E7D32" : "#D84315",
            fontWeight: "600",
          }}
          mode="outlined"
        >
          {pet?.name || "Unknown"}
        </Chip>

        <Divider />
        <Text variant="titleMedium">{pet.breed}</Text>
        {pet.colors && <Text variant="bodyLarge">{pet.colors}</Text>}
        {pet.gender && <Text variant="bodyLarge">{pet.gender}</Text>}

        {pet.created_at && (
          <Text variant="bodyLarge">
            Reported missing at: {new Date(pet.created_at).toLocaleString()}
          </Text>
        )}
        {pet.features && (
          <Text variant="bodyLarge">Features: {pet.features}</Text>
        )}

        {pet.last_seen_time && (
          <Text variant="bodyLarge">
            Last Seen: {new Date(pet.last_seen_time).toLocaleString()}
          </Text>
        )}
        <Text variant="bodyLarge">Last Seen at: {pet.last_seen_location}</Text>
        {reporter && <Text variant="bodyLarge">Reported by {reporter}</Text>}
      </Card.Content>
      <Card.Actions>
        <View style={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
          <Button
            style={{ marginBottom: 10 }}
            mode="contained"
            onPress={() => router.push(`/sightings/${pet.pet_id}`)}
          >
            Add Details
          </Button>
          {/*reporter && (
            <Button
              style={{ width: "100%" }}
              mode="outlined"
              onPress={() => console.log("Pressed")}
            >
              Contact {reporter}
            </Button>
          )*/}
        </View>
      </Card.Actions>
    </Card>
  );
}
