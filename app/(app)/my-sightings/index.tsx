import { RenderSightingProfile } from "@/components/pet-profile";
import SightingPage from "@/components/sightings/sighting-page";
import { AggregatedSighting } from "@/db/models/sighting";
import { useTelemetryProvider } from "@/instrumentation/telemetry-provider";
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
  const { startInstrument } = useTelemetryProvider(); // Initialize telemetry provider to capture performance metrics

  startInstrument({
    eventName: "sighting_list_event",
    step: "request_start",
    eventData: {
      user_type: "authenticated",
    },
    status: "success",
  });

  const onSightingPress = useCallback(
    (sighting: AggregatedSighting) => {
      startInstrument({
        eventName: "sighting_detail_event",
        step: "request_start",
        eventData: {
          user_type: "authenticated",
        },
        status: "success",
      });

      router.push(
        `/(app)/my-sightings/${sighting.id}/?petId=${sighting.petId}&linkedSightingId=${sighting.linkedSightingId}`,
      );
    },
    [router, startInstrument],
  );

  const rendererItem = useCallback(
    ({ item }: { item: AggregatedSighting }) => (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onSightingPress(item)}
      >
        <RenderSightingProfile pet={item} />
      </TouchableOpacity>
    ),
    [onSightingPress],
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
