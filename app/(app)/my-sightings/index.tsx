import { RenderSightingProfile } from "@/components/pet-profile";
import SightingPage from "@/components/sightings/sighting-page";
import { AggregatedSighting } from "@/db/models/sighting";
import { useRouter } from "expo-router";
import React, { JSX, useCallback } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Text } from "react-native-paper";

export default function SightingList() {
  const router = useRouter();

  const rendererItem = useCallback(
    ({ item }: { item: AggregatedSighting }) => (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() =>
          router.push(
            `/(app)/my-sightings/${item.linkedSightingId}/?petId=${item.petId}`,
          )
        }
      >
        <RenderSightingProfile pet={item} />
      </TouchableOpacity>
    ),
    [router],
  );

  const renderer = useCallback(
    (
      sightings: AggregatedSighting[],
      onEndReached: () => void,
      ListEmptyComponent: () => JSX.Element,
      onRefresh: () => void,
      refreshing: boolean,
    ) => (
      <View style={styles.container}>
        <FlatList
          data={sightings}
          keyExtractor={(item) => item.id}
          renderItem={rendererItem}
          ListEmptyComponent={ListEmptyComponent}
          style={{ marginBottom: 20 }}
          showsVerticalScrollIndicator={false}
          snapToAlignment="start"
          decelerationRate="fast"
          pagingEnabled
          onEndReached={onEndReached}
          onEndReachedThreshold={0.9}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListFooterComponent={() => {
            return (
              <View style={{ paddingVertical: 25 }}>
                <Text style={{ textAlign: "center" }}> </Text>
              </View>
            );
          }}
        />
      </View>
    ),
    [rendererItem],
  );

  return <SightingPage renderer={renderer} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 5,
    backgroundColor: "#fff",
    minHeight: "100%",
  },
});
