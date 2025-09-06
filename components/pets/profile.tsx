import React from "react";
import { View, Image, StyleSheet } from "react-native";
import { Card, Text, Chip, Divider, Button } from "react-native-paper";

type PetProfile = {
  name: string;
  breed?: string;
  gender?: string;
  age?: string;
  colors?: string;
  photo?: string;
  status?: "lost" | "found" | "safe";
  features?: string;
  species?: string;
  note?: string;
};

type PetProfileCardProps = {
  petProfile: PetProfile;
  onEdit: () => void;
  onPetFound: () => void;
  onPetLost: () => void;
  createTwoButtonAlert: () => void;
};

const PetProfileCard: React.FC<PetProfileCardProps> = ({
  petProfile,
  onEdit,
  onPetFound,
  onPetLost,
  createTwoButtonAlert,
}) => {
  const {
    name,
    breed,
    gender,
    age,
    colors,
    photo,
    status,
    features,
    species,
    note,
  } = petProfile;
  const getStatusColor = () => {
    switch (status) {
      case "lost":
        return { bg: "#FFEBEE", text: "#C62828" }; // red
      case "found":
        return { bg: "#FFF3E0", text: "#EF6C00" }; // orange
      case "safe":
        return { bg: "#E8F5E9", text: "#2E7D32" }; // green
      default:
        return { bg: "#ECEFF1", text: "#37474F" }; // grey
    }
  };

  return (
    <Card style={styles.card}>
      {photo ? (
        <Image source={{ uri: photo }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <Text style={styles.placeholderText}>No Photo</Text>
        </View>
      )}

      <Card.Content>
        <View style={styles.header}>
          <Text style={styles.name}>{name || "Unknown"}</Text>
          {status && (
            <Chip
              style={{
                backgroundColor: getStatusColor().bg,
              }}
              textStyle={{ color: getStatusColor().text, fontWeight: "bold" }}
            >
              {status.toUpperCase()}
            </Chip>
          )}
        </View>

        {gender && <Text style={styles.detail}>🐾 Gender: {gender}</Text>}
        {breed && <Text style={styles.detail}>🐾 Breed: {breed}</Text>}
        {species && <Text style={styles.detail}>🐾 Species: {species}</Text>}
        {age !== undefined && <Text style={styles.detail}>🎂 Age: {age}</Text>}
        {colors && <Text style={styles.detail}>🎨 Color: {colors}</Text>}
        {features && <Text style={styles.detail}>⭐ Features: {features}</Text>}
        {note && <Text style={styles.detail}>📝 Notes: {note}</Text>}
      </Card.Content>
      <Card.Actions>
        <View style={styles.buttonContainer}>
          <Button
            icon={"paw"}
            theme={{ colors: { primary: "blue" } }}
            mode={"text"}
            style={{ backgroundColor: "transparent", marginTop: 15 }}
            onPress={() => onEdit()}
            compact={true}
          >
            Edit
          </Button>

          <Button
            icon={"paw"}
            theme={{ colors: { primary: "red" } }}
            mode={"text"}
            style={{ backgroundColor: "transparent", marginTop: 15 }}
            onPress={() => createTwoButtonAlert()}
            compact={true}
          >
            Delete
          </Button>

          {status === "lost" && (
            <Button
              icon={"paw"}
              theme={{ colors: { primary: "green" } }}
              mode={"text"}
              style={{ backgroundColor: "transparent", marginTop: 15 }}
              onPress={() => onPetFound()}
              compact={true}
            >
              Report Pet Found
            </Button>
          )}
          {status === "safe" && (
            <Button
              icon={"paw"}
              theme={{ colors: { primary: "purple" } }}
              mode={"text"}
              style={{ backgroundColor: "transparent", marginTop: 15 }}
              onPress={() => onPetLost()}
              compact={true}
            >
              Report Lost Pet
            </Button>
          )}
        </View>
      </Card.Actions>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 12,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 300,
    resizeMode: "cover",
  },
  placeholder: {
    backgroundColor: "#CFD8DC",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#546E7A",
    fontSize: 14,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
  },
  detail: {
    fontSize: 16,
    color: "#555",
    marginTop: 2,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

export default PetProfileCard;
