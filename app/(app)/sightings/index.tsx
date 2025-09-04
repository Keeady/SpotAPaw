import { RenderShortProfile, RenderSightingProfile } from "@/components/pet-profile";
import { AuthContext } from "@/components/Provider/auth-provider";
import { supabase } from "@/components/supabase-client";
import { router } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { showMessage } from "react-native-flash-message";
import { Button, Text, TextInput } from "react-native-paper";

export default function SightingList() {
  const [sightings, setSightings] = useState([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [extra_info, setExtraInfo] = useState("");
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!user) {
      return;
    }

    setLoading(true);
    supabase
      .from("sightings")
      .select("*, sighting_contact (sighting_id, name, phone)")
      //.eq("owner_id", user.id)
      .order("sightings.created_at", { ascending: false })
      .then(({ data }) => {
        setLoading(false);
        if (data) {
        setSightings(data);
        }
      });
  }, [user?.id]);

  return (
    <View style={styles.container}>
      <Text variant="titleLarge">Recent Pet Sightings in your area!</Text>
      <FlatList
              data={sightings}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => router.push(`/pets/${item.id}`)}>
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
