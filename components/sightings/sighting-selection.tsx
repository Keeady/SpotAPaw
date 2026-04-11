import { Card, RadioButton, Text } from "react-native-paper";
import { StyleSheet, Image, View, ScrollView } from "react-native";
import { AggregatedSighting } from "@/db/models/sighting";
import { getLastSeenLocationDistance, getLastSeenTimeDistance } from "./util";
import { usePermission } from "../Provider/permission-provider";
import { SightingLocation } from "../get-current-location";

type SightingSelectionProps = {
  setSelectedSightingId: (value: string) => void;
  selectedSightingId: string;
  sightings: AggregatedSighting[];
};

export function SightingSelection({
  setSelectedSightingId,
  selectedSightingId,
  sightings,
}: SightingSelectionProps) {
  const { location: userCurrentLocation } = usePermission();

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          backgroundColor: "#fff",
          padding: 16,
          paddingBottom: 50,
        }}
      >
        <RadioButton.Group
          onValueChange={(value) => setSelectedSightingId(value)}
          value={selectedSightingId}
        >
          {sightings.map((sighting) => (
            <SightingThumbnail
              key={sighting.id}
              setSelectedSightingId={setSelectedSightingId}
              selectedSightingId={selectedSightingId}
              sighting={sighting}
              userCurrentLocation={userCurrentLocation}
            />
          ))}
        </RadioButton.Group>
      </ScrollView>
    </View>
  );
}

type SightingThumbnailProps = {
  setSelectedSightingId: (value: string) => void;
  selectedSightingId: string;
  sighting: AggregatedSighting;
  userCurrentLocation: SightingLocation | undefined;
};

export function SightingThumbnail({
  setSelectedSightingId,
  selectedSightingId,
  sighting,
  userCurrentLocation,
}: SightingThumbnailProps) {
  return (
    <Card
      key={sighting.id}
      style={[
        styles.petCard,
        selectedSightingId === sighting.id && styles.petCardSelected,
      ]}
      onPress={() => setSelectedSightingId(sighting.id)}
    >
      <Card.Title
        title={sighting.name || "Unknown"}
        titleVariant="titleLarge"
        subtitle={`${sighting.breed} ${sighting.species.charAt(0).toUpperCase() + sighting.species.slice(1)}`}
        subtitleVariant="titleMedium"
        right={(props) => (
          <View
            style={{
              flexDirection: "row",
              padding: 10,
              borderRadius: 50,
              backgroundColor:
                Number(sighting?.similarityScore) >= 90 ? "#4caf50" : "#c7ebc8",
              marginRight: 16,
            }}
          >
            <Text>{sighting.similarityScore}%</Text>
          </View>
        )}
      />
      <Card.Content>
        {sighting.photo ? (
          <Image
            source={{ uri: sighting.photo }}
            resizeMode={"contain"}
            style={styles.petImage}
          />
        ) : null}

        <View
          style={{
            flexDirection: "row",
            marginBottom: 10,
            flexWrap: "wrap",
          }}
        >
          <Text variant="labelLarge">Gender: </Text>
          <Text>{sighting.gender}</Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            marginBottom: 10,
            flexWrap: "wrap",
          }}
        ></View>
        <View
          style={{
            flexDirection: "row",
            marginBottom: 10,
            flexWrap: "wrap",
          }}
        >
          <Text variant="labelLarge">Last seen: </Text>
          <Text>{getLastSeenTimeDistance(sighting.lastSeenTime)}</Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            marginBottom: 10,
            flexWrap: "wrap",
          }}
        >
          <Text variant="labelLarge">Location: </Text>
          <Text>
            {userCurrentLocation
              ? getLastSeenLocationDistance(
                  userCurrentLocation,
                  sighting.lastSeenLat,
                  sighting.lastSeenLong,
                )
              : sighting.lastSeenLocation}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
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
    width: "100%",
    height: undefined,
    aspectRatio: 1,
    borderRadius: 20,
  },
});
