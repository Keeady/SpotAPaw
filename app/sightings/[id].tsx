import {
  RenderShortProfile,
  RenderSightingProfile,
} from "@/components/pet-profile";
import { AuthContext } from "@/components/Provider/auth-provider";
import { supabase } from "@/components/supabase-client";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { showMessage } from "react-native-flash-message";
import { Button, Card, Divider, Text } from "react-native-paper";
import { Alert, Image, StyleSheet, View } from "react-native";
import { Pet } from "@/model/pet";
import SightingDetail from "@/components/sightings/sighting-details";

export default function SightingProfile() {
  const { id } = useLocalSearchParams();
  console.log(id)

  const [sightings, setSightings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [extra_info, setExtraInfo] = useState("");

  useEffect(() => {
    if (!id) {
        return;
    }
    setLoading(true);
    supabase
      .from("sightings")
      .select("*")
      .eq("pet_id", id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        console.log(data)
        if (data) {
          setSightings(data);
        }
      });

    setLoading(false);
  }, []);

const onAddTimeline = useCallback(() => {
    console.log("adding timeline")
    router.navigate(`/sightings/new/?id=${id}`)
}, []);

if (!sightings || sightings.length === 0) {
    return null;
}

const latest = sightings[0];

return (
    SightingDetail({sightings, pet: latest, onEdit: onAddTimeline})
  );
}
