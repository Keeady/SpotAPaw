import * as React from "react";
import {
  Linking,
  ScrollView,
  TouchableOpacity,
  View,
  StyleSheet,
  Image,
} from "react-native";
import { Card, Avatar, Text, Divider, IconButton } from "react-native-paper";
import { formatDistanceToNow } from "date-fns";

export default function SightingDetail({ sightings, pet, onEdit, onPetFound }) {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff", padding: 16 }}>
      <Card>
        <Card.Title
          title={pet?.name || "Unknown"}
          titleVariant="titleLarge"
          right={() => (
            <View style={{ flexDirection: "row" }}>
              {onEdit && (
                <IconButton
                  icon="pencil-plus"
                  iconColor="blue"
                  onPress={() => onEdit(pet?.id)}
                />
              )}
              {onPetFound && (
                <IconButton
                  icon="check-bold"
                  iconColor="green"
                  onPress={() => onPetFound()}
                />
              )}
            </View>
          )}
        />
        <Card.Content>
          {pet?.photo && (
            <Image
              source={{ uri: pet?.photo }}
              resizeMode="cover"
              style={{
                width: "100%",
                height: 300,
              }}
            />
          )}
          <Divider />
          <View
            style={{ marginTop: 10, marginBottom: 10, flexDirection: "row" }}
          >
            {pet?.color && <Text>{pet?.color}, </Text>}
            {pet?.gender && <Text>{pet?.gender}, </Text>}
            {pet?.breed && <Text>{pet?.breed}</Text>}
          </View>
          {pet?.features && (
            <View
              style={{ marginTop: 10, marginBottom: 10, flexDirection: "row" }}
            >
              <Text>{pet?.features}</Text>
            </View>
          )}
          {pet?.note && (
            <View
              style={{ marginTop: 10, marginBottom: 10, flexDirection: "row" }}
            >
              <Text>{pet?.note}</Text>
            </View>
          )}
        </Card.Content>
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
                        {sighting.last_seen_location || "Location not provided"}
                      </Text>
                    </TouchableOpacity>
                  }
                  left={(props) =>
                    sighting.photo ? (
                      <Avatar.Image
                        size={40}
                        source={{ uri: sighting.photo }}
                      />
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
                    {sighting?.color && <Text>{sighting?.color}, </Text>}
                    {sighting?.gender && <Text>{sighting?.gender}, </Text>}
                    {sighting?.breed && <Text>{sighting?.breed}</Text>}
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
                  {sighting.sighting_contact && (
                    <Text style={{ color: "#1E88E5", fontWeight: "600" }}>
                      Contact reporter
                    </Text>
                  )}
                </Card.Content>
              </Card>
            </View>
          </View>
        );
      })}
    </ScrollView>
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
});
