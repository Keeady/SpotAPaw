import React from "react";
import { View, Image, StyleSheet, ScrollView } from "react-native";
import { Card, Text, Chip, Button } from "react-native-paper";
import { useTranslation } from "react-i18next";

type PetProfile = {
  id: string;
  name: string;
  breed?: string;
  gender?: string;
  age?: number;
  colors?: string;
  photo?: string;
  status?: "lost" | "found" | "safe";
  features?: string;
  species?: string;
  note?: string;
};

type PetProfileCardProps = {
  petProfile: PetProfile;
  onDeletePet: () => void;
  onEditPet: () => void;
  onPetLost: () => void;
  onPetFound: () => void;
  viewPetSightings: () => void;
};

const PetProfileCard: React.FC<PetProfileCardProps> = ({
  petProfile,
  onEditPet,
  onPetFound,
  onPetLost,
  onDeletePet,
  viewPetSightings,
}) => {
  const { t } = useTranslation(["petprofile", "translation"]);
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
    <ScrollView>
      <Card style={styles.card}>
        {photo ? (
          <Image
            source={{ uri: photo }}
            style={styles.image}
            resizeMode="contain"
          />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <Text style={styles.placeholderText}>
              {t("noPhoto", "No Photo")}
            </Text>
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
                {t(`status.${status}`)}
              </Chip>
            )}
          </View>

          {gender && (
            <Text style={styles.detail}>
              🐾 {t("genderLabel", { ns: "translation" })}:{" "}
              {t(`gender.${gender}`, { ns: "translation" })}
            </Text>
          )}
          {breed && (
            <Text style={styles.detail}>
              🐾 {t("breed", "Breed:")} {breed}
            </Text>
          )}
          {species && (
            <Text style={styles.detail}>
              🐾 {t("species", "Species", { ns: "translation" })}:{" "}
              {t(`animals.${species}`, species, { ns: "translation" })}
            </Text>
          )}
          {age !== undefined && (
            <Text style={styles.detail}>
              🎂 {t("ageLabel", "Age", { ns: "translation" })}:{" "}
              {t("ageWithCount", age.toString(), {
                count: age,
                ns: "translation",
              })}
            </Text>
          )}
          {colors && (
            <Text style={styles.detail}>
              🎨 {t("colors", "Colors:")} {colors}
            </Text>
          )}
          {features && (
            <Text style={styles.detail}>
              ⭐ {t("features", "Features:" )} {features}
            </Text>
          )}
          {note && (
            <Text style={styles.detail}>
              📝 {t("notes", "Notes:")} {note}
            </Text>
          )}
        </Card.Content>
        <Card.Actions>
          <View style={{ flex: 1, flexDirection: "column" }}>
            <View style={styles.buttonContainer}>
              <Button
                icon={"paw"}
                theme={{ colors: { primary: "blue" } }}
                mode={"text"}
                style={{ backgroundColor: "transparent", marginTop: 15 }}
                onPress={onEditPet}
                compact={true}
              >
                {t("edit", "Edit")}
              </Button>

              <Button
                icon={"paw"}
                theme={{ colors: { primary: "red" } }}
                mode={"text"}
                style={{ backgroundColor: "transparent", marginTop: 15 }}
                onPress={onDeletePet}
                compact={true}
              >
                {t("delete", "Delete")}
              </Button>

              {status === "lost" && (
                <Button
                  icon={"paw"}
                  theme={{ colors: { primary: "green" } }}
                  mode={"text"}
                  style={{ backgroundColor: "transparent", marginTop: 15 }}
                  onPress={onPetFound}
                  compact={true}
                >
                  {t("reportPetFound", "Report Pet Found")}
                </Button>
              )}
              {status === "safe" && (
                <Button
                  icon={"paw"}
                  theme={{ colors: { primary: "purple" } }}
                  mode={"text"}
                  style={{ backgroundColor: "transparent", marginTop: 15 }}
                  onPress={onPetLost}
                  compact={true}
                >
                  {t("reportLostPet", "Report Lost Pet")}
                </Button>
              )}
            </View>
            <View>
              {status === "lost" && (
                <Button
                  icon={"paw"}
                  theme={{ colors: { primary: "#C62828" } }}
                  mode={"text"}
                  style={{ backgroundColor: "transparent", marginTop: 15 }}
                  onPress={viewPetSightings}
                  compact={true}
                >
                  {t("viewPetSightings", "View Pet Sightings")}
                </Button>
              )}
            </View>
          </View>
        </Card.Actions>
      </Card>
    </ScrollView>
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
    height: "auto",
    aspectRatio: 1.5,
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
