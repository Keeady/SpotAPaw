import { getUserLocation } from "@/components/get-current-location";
import { RenderSightingProfile } from "@/components/pet-profile";
import SightingPage from "@/components/sightings/sighting-page";
import { supabase } from "@/components/supabase-client";
import { PetSighting } from "@/model/sighting";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { FAB, Text } from "react-native-paper";

export default function SightingAnonList() {
  const [sightings, setSightings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [extra_info, setExtraInfo] = useState("");
  const radiusKm = 10;

  useEffect(() => {
    setLoading(true);
    /*
    async function getLocationBox() {
      const { lat, lng } = await getUserLocation();

      // ~111 km per 1 degree latitude
      const latDegree = radiusKm / 111;
      // adjust longitude scaling by latitude
      const lngDegree = radiusKm / (111 * Math.cos(lat * (Math.PI / 180)));

      const minLat = lat - latDegree;
      const maxLat = lat + latDegree;
      const minLng = lng - lngDegree;
      const maxLng = lng + lngDegree;

      return {minLat, maxLat, minLng, maxLng}
    }

    getLocationBox()
    .then(({minLat, maxLat, minLng, maxLng}) => {

    supabase
      .from("sightings")
      .select("*")
      .order("created_at", { ascending: false })
      .gte("last_seen_lat", minLat)
      .lte("last_seen_lat", maxLat)
      .gte("last_seen_long", minLng)
      .lte("last_seen_long", maxLng)
      .then(({ data, error }) => {
        if (data) {
          const sightings = [];
          // merge data by pet id
          // create a summary from
          const latestByPet = Object.values(
            data.reduce((acc, sighting) => {
              if (!sighting.pet_id) {
                sightings.push(sighting);
              } else if (!acc[sighting.pet_id]) {
                acc[sighting.pet_id] = sighting;
              } else {
                const merged = acc[sighting.pet_id];
                acc[sighting.pet_id] = {
                  pet_id: sighting.pet_id,
                  photo: merged.photo ?? sighting.photo,
                  name: merged.name ?? sighting.name,
                  colors: merged.colors ?? sighting.colors,
                  breed: merged.breed ?? sighting.breed,
                  species: merged.species ?? sighting.species,
                  gender: merged.gender ?? sighting.gender,
                  features: merged.features ?? sighting.features,
                  last_seen_location:
                    merged.last_seen_location ?? sighting.last_seen_location,
                  last_seen_time: merged.last_seen_time,
                };
              }

              return acc;
            }, {})
          );
          setSightings([...sightings, ...latestByPet]);
        }
      });
    })
    */

    setLoading(false);
  }, []);

  const renderer = (sightings: PetSighting[]) => (
    <View style={styles.container}>
      <FlatList
        data={sightings}
        keyExtractor={(item) => item.pet_id ?? item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              router.push(`/sightings/${item.id}/?petId=${item.pet_id}`)
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
