import { Pet } from "@/model/pet";
import { PetSighting } from "@/model/sighting";
import { router } from "expo-router";
import React, { useState } from "react";
import { View, StyleSheet, Image } from "react-native";
import { Text, Card, Button, RadioButton } from "react-native-paper";

type ClaimSightingProps = {
  sighting: PetSighting;
  pets: Pet[],
  onConfirm: (selectedPetId: string, sightingId: string) => void
}

export default function ClaimSighting({ sighting, pets, onConfirm }: ClaimSightingProps) {
  const [selectedPetId, setSelectedPetId] = useState<string>("");

  if (!sighting) {
    return null;
  }

  if (!pets || pets.length === 0) {
    return (
      <View style={styles.container}>
        <Text variant="bodyLarge" style={{marginTop: 10, marginBottom: 10}}>
          You need to register your pet before making a claim. Please create a
          pet profile.
        </Text>
        <Button
          mode="contained"
          onPress={() => router.navigate("/(app)/pets/new")}
        >
          Add a new Pet
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Sighting section */}
      <Card style={styles.sightingCard}>
        <Card.Title
          title={sighting.name || "Unknown"}
          titleVariant="titleLarge"
        />
        {sighting.photo && (
          <Image
            source={{ uri: sighting.photo }}
            style={styles.sightingImage}
          />
        )}
        <Card.Content>
          <Text>{sighting.features}</Text>
          <Text>{sighting.last_seen_location}</Text>
          <Text>{new Date(sighting.created_at).toLocaleString()}</Text>
        </Card.Content>
      </Card>

      {/* Pet selection */}
      <Text style={styles.sectionTitle}>Select one of your pets</Text>
      <RadioButton.Group
        onValueChange={(value) => setSelectedPetId(value)}
        value={selectedPetId}
      >
        {pets.map((pet) => (
          <Card
            key={pet.id}
            style={[
              styles.petCard,
              selectedPetId === pet.id && styles.petCardSelected,
            ]}
            onPress={() => setSelectedPetId(pet.id)}
          >
            <Card.Title
              title={pet.name}
              subtitle={`${pet.gender}, ${pet.age} years`}
              left={(props) =>
                pet.photo ? (
                  <Image source={{ uri: pet.photo }} style={styles.petImage} />
                ) : null
              }
            />
          </Card>
        ))}
      </RadioButton.Group>

      {/* Confirm */}
      <Button
        mode="contained"
        onPress={() => onConfirm(selectedPetId, sighting.id)}
        disabled={!selectedPetId}
        style={styles.confirmButton}
      >
        Confirm Claim
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  sightingCard: {
    marginBottom: 16,
  },
  sightingImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 12,
  },
  petCard: {
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  petCardSelected: {
    borderColor: "#007bff",
    borderWidth: 2,
  },
  petImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  confirmButton: {
    marginTop: 20,
    borderRadius: 8,
  },
});
