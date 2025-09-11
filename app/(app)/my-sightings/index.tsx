import { RenderSightingProfile } from "@/components/pet-profile";
import SightingPage from "@/components/sightings/sighting-page";
import { isValidUuid } from "@/components/util";
import { PetSighting } from "@/model/sighting";
import { router } from "expo-router";
import React, {  } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { FAB, Text } from "react-native-paper";

export default function SightingList() {
  const renderer = (sightings: PetSighting[]) => (
    <View style={styles.container}>
      <FlatList
        data={sightings}
        keyExtractor={(item) => isValidUuid(item.pet_id) ? item.pet_id : item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              router.push(
                `/(app)/my-sightings/${item.id}/?petId=${item.pet_id}`
              )
            }
          >
            <RenderSightingProfile pet={item} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text
            style={{ alignSelf: "center", marginBottom: 40, marginTop: 40 }}
          >
            No Pet sightings to display
          </Text>
        }
        style={{ marginBottom: 20 }}
      />
      <FAB
        icon="paw"
        label="Report"
        mode="elevated"
        onPress={() => router.push(`/sightings/new`)}
        style={{ position: "absolute", bottom: 50, right: 50 }}
      />
    </View>
  );

  return <SightingPage renderer={renderer} />;
}

const styles = StyleSheet.create({
  title: {
    textAlign: "center",
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: "stretch",
  },
  mt20: {
    marginTop: 20,
  },
  container: {
    flex: 1,
    paddingTop: 10,
    paddingHorizontal: 24,
    alignItems: "center",
    backgroundColor: "#fff",
    minHeight: "100%",
  },
  logo: {
    width: "100%",
    //height: 100,
    marginBottom: 40,
    marginTop: 40,
    resizeMode: "contain",
  },
  button: {
    width: "100%",
    marginBottom: 16,
  },
  secondary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "baseline",
    paddingTop: 4,
    paddingBottom: 4,
  },
});
