import * as React from "react";
import {
  Linking,
  ScrollView,
  TouchableOpacity,
  View,
  StyleSheet,
  Image,
} from "react-native";
import {
  Card,
  Avatar,
  Text,
  Divider,
  IconButton,
  Button,
  Chip,
  FAB,
} from "react-native-paper";
import { formatDistanceToNow } from "date-fns";
import { AuthContext } from "../Provider/auth-provider";
import { useState } from "react";
import ImageViewing from "react-native-image-viewing";
import { PetSighting } from "@/model/sighting";

function dedupPhotos(sightings: PetSighting[]) {
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
  onPetFound
}: {
  sightings: PetSighting[];
  petSummary: PetSighting;
  claimed: boolean;
  onEdit?: () => void;
  onAddSighting: () => void;
  claimPet?: () => void;
  hasOwner: boolean;
  isOwner: boolean;
  onPetFound?: () => void
}) {
  const [isVisible, setIsVisible] = useState(false);
  const uniquePhotos = dedupPhotos(sightings);
  const images = uniquePhotos?.map((url) => ({ uri: url })) || [];

  const handleCall = (phone: string) => {
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  const handleText = (phone: string) => {
    if (phone) Linking.openURL(`sms:${phone}`);
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Scrollable list */}
      <ScrollView style={{ flex: 1, backgroundColor: "#fff", padding: 16 }}>
        <Card>
          <Card.Title
            title={petSummary?.name || "Unknown"}
            titleVariant="titleLarge"
            right={() => (
              <View style={{ flexDirection: "row" }}>
                {onAddSighting && (
                  <IconButton
                    icon="pencil-plus"
                    iconColor="blue"
                    onPress={() => onAddSighting()}
                  />
                )}
              </View>
            )}
          />
          <Card.Content>
            {petSummary?.photo ? (
              <TouchableOpacity onPress={() => setIsVisible(true)}>
                <Image
                  source={{ uri: petSummary?.photo }}
                  resizeMode="cover"
                  style={{
                    width: "100%",
                    height: 300,
                  }}
                />
              </TouchableOpacity>
            ) : (
              <View style={[styles.image, styles.placeholder]}>
                <Text style={styles.placeholderText}>No Photo</Text>
              </View>
            )}
            <Divider />
            <View
              style={{ marginTop: 10, marginBottom: 10, flexDirection: "row" }}
            >
              {petSummary?.colors && <Text>{petSummary?.colors}, </Text>}
              {petSummary?.gender && <Text>{petSummary?.gender}, </Text>}
              {petSummary?.breed && <Text>{petSummary?.breed}</Text>}
            </View>
            {petSummary?.features && (
              <View
                style={{
                  marginTop: 10,
                  marginBottom: 10,
                  flexDirection: "row",
                }}
              >
                <Text>{petSummary?.features}</Text>
              </View>
            )}
            {petSummary?.note && (
              <View
                style={{
                  marginTop: 10,
                  marginBottom: 10,
                  flexDirection: "row",
                }}
              >
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
                <Chip
                  mode="flat"
                  onPress={() => claimPet()}
                  style={{ backgroundColor: "#6684f3ff" }}
                >
                  This is my pet.
                </Chip>
              )}
              {onPetFound && <Button onPress={() => onPetFound()}>Pet Found</Button>}
              {onEdit && (
                <Button onPress={() => onEdit()}>Edit Pet details</Button>
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
          const phone = sighting.sighting_contact?.[0]?.phone;
          const name = sighting.sighting_contact?.[0]?.name;
          const isLatest = index === 0; // assuming sightings sorted DESC by created_at
          return (
            <View key={sighting.id} style={{ flexDirection: "row" }}>
              {/* Timeline column */}
              <View style={{ alignItems: "center", width: 20 }}>
                {/* Dot */}
                <View
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 7,
                    backgroundColor: isLatest ? "#1E88E5" : "#9E9E9E",
                    marginVertical: 4,
                  }}
                />
                {/* Line */}
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
                    title={formatDistanceToNow(new Date(sighting.created_at), {
                      addSuffix: true,
                    })}
                    subtitle={
                      <TouchableOpacity
                        disabled={!sighting.last_seen_location}
                        onPress={() =>
                          Linking.openURL(
                            `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              sighting.last_seen_location
                            )}`
                          )
                        }
                        style={{
                          flexDirection: "row",
                        }}
                      >
                        <Text
                          style={{
                            color: sighting.last_seen_location
                              ? "#1E88E5"
                              : "#666", // blue if clickable
                            textDecorationLine: sighting.last_seen_location
                              ? "underline"
                              : "none",
                          }}
                        >
                          {sighting.last_seen_location ||
                            "Location not provided"}
                        </Text>
                      </TouchableOpacity>
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
                  />
                  <Card.Content>
                    <View
                      style={{
                        marginTop: 6,
                        marginBottom: 6,
                        flexDirection: "row",
                      }}
                    >
                      {sighting?.colors && (
                        <Text style={styles.detail}>{sighting?.colors}, </Text>
                      )}
                      {sighting?.gender && (
                        <Text style={styles.detail}>{sighting?.gender}, </Text>
                      )}
                      {sighting?.breed && (
                        <Text style={styles.detail}>{sighting?.breed}</Text>
                      )}
                    </View>
                    {sighting.features && (
                      <Text
                        variant="bodyMedium"
                        style={{ marginTop: 6, marginBottom: 6 }}
                      >
                        {sighting.features}
                      </Text>
                    )}
                    {sighting.note && (
                      <Text
                        variant="bodyMedium"
                        style={{ marginTop: 6, marginBottom: 6 }}
                      >
                        {sighting.note}
                      </Text>
                    )}
                    {isOwner && name && phone && (
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "flex-start",
                          gap: 8,
                        }}
                      >
                        <Text style={{ alignSelf: "center" }}>
                          Reported by {name}
                        </Text>
                        <Button
                          mode="contained"
                          icon="phone"
                          onPress={() => handleCall(phone)}
                        >
                          Call
                        </Button>
                        <Button
                          mode="outlined"
                          icon="message-text"
                          onPress={() => handleText(phone)}
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
        <View>
          {/* Fullscreen Viewer */}
          <ImageViewing
            images={images}
            imageIndex={0}
            visible={isVisible}
            onRequestClose={() => setIsVisible(false)}
          />
        </View>
      </ScrollView>
      <FAB
        icon="paw"
        label="Report"
        mode="elevated"
        onPress={() => onAddSighting()}
        style={{ position: "absolute", bottom: 50, right: 50 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  emptyPreview: {
    width: "100%",
    height: 300,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ddd",
    marginTop: 5,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  fullImage: {
    width: "90%",
    height: "70%",
    borderRadius: 12,
  },
  // card styles unused
  card: {
    margin: 12,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 180,
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
    fontSize: 14,
    color: "#555",
    marginTop: 2,
  },
});
