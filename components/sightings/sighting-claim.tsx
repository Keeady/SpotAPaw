import { Pet } from "@/model/pet";
import { PetSighting } from "@/model/sighting";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { View, StyleSheet, Image, ScrollView } from "react-native";
import { Text, Card, Button } from "react-native-paper";
import { isValidUuid } from "../util";
import { PetSelection } from "./pet-selection";

type ClaimSightingProps = {
  sighting: PetSighting;
  pets: Pet[];
  onConfirm: (selectedPetId: string, sightingId: string) => void;
};

export default function ClaimSighting({
  sighting,
  pets,
  onConfirm,
}: ClaimSightingProps) {
  const router = useRouter();

  const [disabled, setDisabled] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState<string>("");

  const onSubmit = (selectedPetId: string, sightingId: string) => {
    if (!selectedPetId || !isValidUuid(selectedPetId)) {
      setDisabled(false);
      return;
    }

    try {
      setDisabled(true);
      onConfirm(selectedPetId, sightingId);
    } catch {
      setDisabled(false);
    }
  };

  if (!sighting) {
    return null;
  }

  if (!pets || pets.length === 0) {
    return (
      <View style={styles.container}>
        <Text variant="bodyLarge" style={{ marginTop: 10, marginBottom: 10 }}>
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
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ flexGrow: 1 }}>
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
        <PetSelection selectedPetId={selectedPetId} setSelectedPetId={setSelectedPetId} pets={pets} />

        {/* Confirm */}
        <Button
          mode="contained"
          onPress={() => onSubmit(selectedPetId, sighting.id)}
          disabled={!selectedPetId || disabled}
          style={styles.confirmButton}
        >
          Confirm Claim
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
  confirmButton: {
    marginTop: 20,
    borderRadius: 8,
  },
});
