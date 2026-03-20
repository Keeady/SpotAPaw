import * as React from "react";
import {
  Linking,
  ScrollView,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import {
  Card,
  Avatar,
  Text,
  Divider,
  Button,
  Chip,
  Portal,
  Icon,
  useTheme,
} from "react-native-paper";
import { useState } from "react";
import ReportLostPetFab from "./report-fab";
import {
  getLastSeenLocationDistance,
  getLastSeenLocationURLMap,
  getLastSeenTimeDistance,
} from "./util";
import { usePermission } from "../Provider/permission-provider";
import SightingGallery from "./gallery";
import { AggregatedSighting } from "@/db/models/sighting";

function dedupPhotos(sightings: AggregatedSighting[]) {
  const seen = new Set();
  const photos: string[] = [];

  sightings.forEach((s) => {
    if (s.photo && !seen.has(s.photo)) {
      seen.add(s.photo);
      photos.push(s.photo);
    }
  });

  return photos;
}

export default function SightingDetail({
  sightings,
  petSummary,
  onAddSighting,
  onEdit,
  claimPet,
  claimed,
  hasOwner,
  isOwner,
  onPetFound,
  petName,
}: {
  sightings: AggregatedSighting[];
  petSummary: AggregatedSighting;
  claimed: boolean;
  onEdit?: () => void;
  onAddSighting: () => void;
  claimPet?: () => void;
  hasOwner: boolean;
  isOwner: boolean;
  onPetFound?: () => void;
  petName: string;
}) {
  const theme = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const uniquePhotos = dedupPhotos(sightings);
  const images = uniquePhotos?.map((url) => ({ uri: url })) || [];
  const { location: userCurrentLocation } = usePermission();

  const handleCall = (phone: string) => {
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  const handleText = (phone: string) => {
    if (phone) Linking.openURL(`sms:${phone}`);
  };

  return (
    <Portal.Host>
      <View style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            backgroundColor: "#fff",
            padding: 16,
            paddingBottom: 50,
          }}
        >
          <Card>
            <Card.Title
              title={petSummary?.name || petName || "Unknown"}
              titleVariant="titleLarge"
            />
            <Card.Content>
              <SightingGallery
                images={images}
                isVisible={isVisible}
                setIsVisible={setIsVisible}
                mainPhoto={petSummary?.photo}
              />

              <Divider />
              {petSummary?.breed && (
                <Text variant="titleLarge" style={styles.title}>
                  {petSummary.breed}{" "}
                  {petSummary.species.charAt(0).toUpperCase() +
                    petSummary.species.slice(1)}
                </Text>
              )}
              {petSummary?.colors && (
                <View
                  style={{
                    flexDirection: "row",
                    marginBottom: 10,
                    flexWrap: "wrap",
                  }}
                >
                  <Text variant="labelLarge">Colors: </Text>
                  <Text>{petSummary?.colors}</Text>
                </View>
              )}
              {petSummary?.gender && (
                <View style={{ flexDirection: "row", marginBottom: 10 }}>
                  <Text variant="labelLarge">Gender: </Text>
                  <Text>{petSummary?.gender}</Text>
                </View>
              )}
              <Divider />

              {petSummary?.features && (
                <View
                  style={{
                    marginTop: 10,
                    marginBottom: 10,
                    flexDirection: "row",
                    flexWrap: "wrap",
                  }}
                >
                  <Text variant="labelLarge">Features: </Text>
                  <Text>{petSummary?.features}</Text>
                  <Divider />
                </View>
              )}

              {petSummary?.note && (
                <View
                  style={{
                    marginTop: 10,
                    marginBottom: 10,
                    flexDirection: "row",
                    flexWrap: "wrap",
                  }}
                >
                  <Text variant="labelLarge">Notes: </Text>
                  <Text>{petSummary?.note}</Text>
                </View>
              )}
            </Card.Content>
            <Card.Actions>
              <View style={{ flexDirection: "row", gap: 10 }}>
                {claimed && (
                  <Chip mode="outlined" disabled={claimed}>
                    Owner Pending
                  </Chip>
                )}
                {!hasOwner && claimPet && (
                  <Button mode="contained" onPress={() => claimPet()}>
                    This is my pet.
                  </Button>
                )}
                {onPetFound && (
                  <Button onPress={() => onPetFound()}>Pet Found</Button>
                )}
                {onEdit && (
                  <Button onPress={() => onEdit()}>Edit Sighting</Button>
                )}
              </View>
            </Card.Actions>
          </Card>

          <Text
            variant="titleLarge"
            style={{
              marginTop: 16,
              marginBottom: 16,
              fontSize: 22,
              fontWeight: "bold",
            }}
          >
            Sighting Timeline
          </Text>

          {sightings.map((sighting, index) => {
            const reportName = sighting.reporterName;
            const reporterPhone = sighting.reporterPhone;
            const isLatest = index === 0; // assuming sightings sorted DESC by created_at
            return (
              <View key={sighting.id} style={{ flexDirection: "row" }}>
                <View style={{ alignItems: "center", width: 20 }}>
                  <View
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 7,
                      backgroundColor: isLatest ? "#1E88E5" : "#9E9E9E",
                      marginVertical: 4,
                    }}
                  />
                  {index < sightings.length - 1 && (
                    <View
                      style={{
                        flex: 1,
                        width: 2,
                        backgroundColor: "#ccc",
                        marginTop: 2,
                      }}
                    />
                  )}
                </View>

                {/* Card content */}
                <View style={{ flex: 1, marginBottom: 16 }}>
                  <Card style={{ elevation: isLatest ? 4 : 1 }}>
                    <Card.Title
                      title={getLastSeenTimeDistance(sighting.lastSeenTime)}
                      titleVariant="labelLarge"
                      subtitle={
                        <View style={{ flexDirection: "row", gap: 8 }}>
                          <Icon source={"map-marker-path"} size={20} />
                          <Text variant={"labelLarge"}>
                            {userCurrentLocation && sighting.lastSeenLat && sighting.lastSeenLong
                              ? getLastSeenLocationDistance(
                                  userCurrentLocation,
                                  sighting.lastSeenLat,
                                  sighting.lastSeenLong,
                                )
                              : "No distance data"}
                          </Text>
                        </View>
                      }
                      left={(props) =>
                        sighting.photo ? (
                          <TouchableOpacity onPress={() => setIsVisible(true)}>
                            <Avatar.Image
                              size={40}
                              source={{ uri: sighting.photo }}
                            />
                          </TouchableOpacity>
                        ) : (
                          <Avatar.Icon {...props} icon="paw" />
                        )
                      }
                      right={() => (
                        <TouchableOpacity
                          disabled={
                            !sighting.lastSeenLocation &&
                            (!sighting.lastSeenLat || !sighting.lastSeenLong)
                          }
                          onPress={() =>
                            Linking.openURL(
                              getLastSeenLocationURLMap(
                                sighting.lastSeenLocation,
                                sighting.lastSeenLat,
                                sighting.lastSeenLong,
                              ),
                            )
                          }
                          style={{
                            flexDirection: "row",
                            padding: 10,
                            borderRadius: 50,
                            backgroundColor: theme.colors.inversePrimary,
                            marginRight: 16,
                          }}
                        >
                          <Icon source={"arrow-top-right"} size={30} />
                        </TouchableOpacity>
                      )}
                    />
                    <Card.Content>
                      <View
                        style={{
                          marginTop: 6,
                          marginBottom: 6,
                          flexWrap: "wrap",
                        }}
                      >
                        {sighting?.breed && (
                          <Text style={styles.detail}>
                            Breed: {sighting?.breed}
                          </Text>
                        )}

                        {sighting?.colors && (
                          <Text style={styles.detail}>
                            Colors: {sighting?.colors}
                          </Text>
                        )}
                        {sighting?.gender && (
                          <Text style={styles.detail}>
                            Gender: {sighting?.gender}
                          </Text>
                        )}
                      </View>
                      {sighting.features && (
                        <Text
                          variant="bodyMedium"
                          style={{ marginTop: 6, marginBottom: 6 }}
                        >
                          Features: {sighting.features}
                        </Text>
                      )}
                      {sighting.note && (
                        <Text
                          variant="bodyMedium"
                          style={{ marginTop: 6, marginBottom: 6 }}
                        >
                          Notes: {sighting.note}
                        </Text>
                      )}

                      <Divider />

                      {isOwner && reporterPhone && (
                        <View
                          style={{
                            alignItems: "center",
                            flexDirection: "row",
                            flexWrap: "wrap",
                            marginTop: 10,
                          }}
                        >
                          <Text variant="labelLarge">Reported by: </Text>
                          <Text>{reportName}</Text>
                          <Button
                            mode="text"
                            icon="phone"
                            onPress={() => handleCall(reporterPhone)}
                            compact
                          >
                            Call
                          </Button>
                          <Button
                            mode="text"
                            icon="message-text"
                            onPress={() => handleText(reporterPhone)}
                            compact
                          >
                            Text
                          </Button>
                        </View>
                      )}
                    </Card.Content>
                  </Card>
                </View>
              </View>
            );
          })}
        </ScrollView>

        <ReportLostPetFab
          onFormPress={() => onAddSighting()}
          title={"Seen This Pet?"}
        />
      </View>
    </Portal.Host>
  );
}

const styles = StyleSheet.create({
  name: {
    fontSize: 20,
    fontWeight: "bold",
  },
  detail: {
    fontSize: 14,
    color: "#555",
    marginTop: 2,
  },
  title: {
    paddingHorizontal: 25,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 10,
    flexWrap: "wrap",
  },
});
