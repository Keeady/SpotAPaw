import { RenderSightingProfile } from "@/components/pet-profile";
import SightingPage from "@/components/sightings/sighting-page";
import { isValidUuid } from "@/components/util";
import { PetSighting } from "@/model/sighting";
import { useRouter } from "expo-router";
import React, { useCallback } from "react";
import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { FAB } from "react-native-paper";
import { EmptySighting } from "@/components/sightings/empty-sighting";

export default function SightingAnonList() {
  const router = useRouter();
  const { height } = useWindowDimensions();

  const renderer = useCallback(
    (sightings: PetSighting[], onEndReached: () => void, error: string) => (
      <View style={styles.container}>
        <FlatList
          data={sightings}
          keyExtractor={(item) =>
            isValidUuid(item.pet_id) ? item.pet_id : item.id
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                router.push(`/sightings/${item.id}/?petId=${item.pet_id}`)
              }
            >
              <RenderSightingProfile pet={item} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={<EmptySighting height={height} error={error} />}
          style={{ marginBottom: 20 }}
          showsVerticalScrollIndicator={false}
          snapToAlignment="start"
          decelerationRate="fast"
          pagingEnabled
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
        />
        <FAB
          icon="paw"
          label="Report"
          mode="elevated"
          onPress={() => router.push(`/sightings/new`)}
          style={{ position: "absolute", bottom: 100, right: 50 }}
        />
      </View>
    ),
    [router, height]
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
