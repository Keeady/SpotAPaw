import React from "react";
import { Image, View, StyleSheet } from "react-native";
import { Card, Chip, Divider, Icon, Text, useTheme } from "react-native-paper";
import { getIconByAnimalSpecies } from "./util";
import {
  getLastSeenLocationDistance,
  getLastSeenTimeDistance,
} from "./sightings/util";
import { usePermission } from "./Provider/permission-provider";

export function RenderPetProfile(data) {
  const pet = data.pet;

  return (
    <Card>
      {pet.photo && (
        <Image
          source={{ uri: pet.photo }}
          resizeMode="cover"
          style={{
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
  const theme = useTheme();
  const { location: userCurrentLocation } = usePermission();
  const pet = data.pet;
  return (
    <Card
      style={{
        borderRadius: 20,
        margin: 5,
        marginBottom: 10,
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
        {pet?.name && (
          <View style={styles.header}>
            <Text variant="labelLarge" style={{ alignSelf: "center" }}>
              Name:
            </Text>
            <Chip
              style={{
                backgroundColor: pet?.name ? "#E6F7E6" : "#FFF4E5",
                marginVertical: 10,
                alignSelf: "flex-start",
                paddingHorizontal: 10,
                paddingVertical: 2,
                borderRadius: 12,
              }}
              textStyle={{
                color: pet?.name ? "#2E7D32" : "#D84315",
                fontWeight: "600",
              }}
              mode="outlined"
            >
              {pet.name}
            </Chip>
          </View>
        )}

        <Divider />
        <View style={styles.line}>
          <View style={styles.header}>
            <Icon
              source={getIconByAnimalSpecies(pet.species)}
              size={25}
              color={theme.colors.primary}
            />
            <Text variant="labelLarge">Type:</Text>
          </View>
          <Text variant="bodyLarge" style={styles.title}>
            {pet.breed}{" "}
            {pet.species.charAt(0).toUpperCase() + pet.species.slice(1)}
          </Text>
        </View>

        <Divider />

        {pet.last_seen_time && (
          <View style={styles.line}>
            <View style={styles.header}>
              <Icon
                source={"map-marker"}
                size={25}
                color={theme.colors.primary}
              />
              <Text variant="labelLarge">Last Seen:</Text>
            </View>
            <View style={{flexDirection: "row", justifyContent: "space-around"}}>
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
              }}
            >
              <Icon
                source={"calendar"}
                size={25}
                color={theme.colors.primary}
              />
              <Text variant="bodyLarge" style={styles.title}>
                {getLastSeenTimeDistance(pet.last_seen_time)}
              </Text>
            </View>

            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
              }}
            >
              <Icon
                source={"map-marker-path"}
                size={25}
                color={theme.colors.primary}
              />
              <Text variant="bodyLarge" style={styles.title}>
                {userCurrentLocation &&
                  getLastSeenLocationDistance(
                    userCurrentLocation,
                    pet.last_seen_lat,
                    pet.last_seen_long,
                  )}
              </Text>
            </View>
            </View>

          </View>
        )}

        <Divider />

        {pet.features && (
          <View style={styles.line}>
            <View style={styles.header}>
              <Icon
                source={"note-multiple"}
                size={25}
                color={theme.colors.primary}
              />
              <Text variant="labelLarge">Features:</Text>
            </View>
            <Text variant="bodyLarge" style={styles.title}>
              {pet.colors && `Colors: ${pet.colors}`}
              {pet.gender && `\nGender: ${pet.gender}`}
              {pet.age && `\nAge: ${pet.age} years old`}
            </Text>
            <Divider />
            <Text variant="bodyLarge" style={styles.title}>
              {pet.features}
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  line: {
    paddingVertical: 5,
  },
  header: {
    flexDirection: "row",
    alignContent: "center",
    gap: 5,
    alignItems: "center",
  },
  title: { paddingHorizontal: 25 },
});
