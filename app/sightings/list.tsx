import {
  RenderShortProfile,
  RenderSightingProfile,
} from "@/components/pet-profile";
import { AuthContext } from "@/components/Provider/auth-provider";
import { supabase } from "@/components/supabase-client";
import { router } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { showMessage } from "react-native-flash-message";
import { Button, Text, TextInput } from "react-native-paper";

export default function SightingAnonList() {
  const [sightings, setSightings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [extra_info, setExtraInfo] = useState("");

  useEffect(() => {
    setLoading(true);
    supabase
      .from("sightings")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) {
          const latestByPet = Object.values(
            data.reduce((acc, sighting) => {
              if (!acc[sighting.pet_id]) {
                acc[sighting.pet_id] = sighting;
              }
              return acc;
            }, {})
          );
          setSightings(latestByPet);
        }
      });

    setLoading(false);
  }, []);

  return (
    <View style={styles.container}>
      <Text variant="titleLarge">Recent Pet Sightings in your area!</Text>
      <FlatList
        data={sightings}
        keyExtractor={(item) => item.pet_id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push(`/sightings/${item.pet_id}`)}>
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
        //style={{ marginBottom: 20 }}
      />
    </View>
  );
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
    paddingTop: 80,
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
