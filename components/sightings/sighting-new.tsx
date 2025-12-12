import { getCurrentLocationV1 } from "@/components/get-current-location";
import { supabase } from "@/components/supabase-client";
import { PetSighting } from "@/model/sighting";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import { Image, Platform, ScrollView, StyleSheet, View } from "react-native";
import { showMessage } from "react-native-flash-message";
import {
  Button,
  RadioButton,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { AuthContext } from "../Provider/auth-provider";
import { pickImage } from "../image-picker";
import useUploadPetImageUrl from "../image-upload";
import { isValidUuid } from "../util";
import { log } from "../logs";

export default function CreateNewSighting() {
  const theme = useTheme();
  const { id, petId } = useLocalSearchParams<{ id: string; petId: string }>();

  const [loading, setLoading] = useState(false);
  const [colors, setColors] = useState("");
  const [breed, setBreed] = useState("");
  const [species, setSpecies] = useState("");
  const [gender, setGender] = useState("");
  const [features, setFeatures] = useState("");
  const [photo, setPhoto] = useState("");
  const [location, setLocation] = useState("");
  const [coords, setCoords] = useState<Location.LocationObjectCoords>();
  const [extra_info, setExtraInfo] = useState("");
  const [note, setNote] = useState("");
  const [empty, setEmpty] = useState(true);
  const [linked_sighting_id, setLinkedSightingId] = useState();
  const { user } = useContext(AuthContext);

  const router = useRouter();
  const uploadImage = useUploadPetImageUrl();

  useEffect(() => {
    if (colors && species && features && location) {
      setEmpty(false);
    } else {
      setEmpty(true);
    }
  }, [location, colors, species, features]);

  useEffect(() => {
    if (id && isValidUuid(id)) {
      setLoading(true);
      supabase
        .from("sightings")
        .select("*")
        .eq("id", id)
        .single()
        .then(({ data }) => {
          setColors(data.colors);
          setBreed(data.breed);
          setSpecies(data.species);
          setGender(data.gender);
          setFeatures(data.features);
          setNote(data.note);
          setLinkedSightingId(data.linked_sighting_id);
          setPhoto(data.photo);
        });
    }

    setLoading(false);
  }, [id]);

  async function saveSighting(photo: string) {
    const sightingId = isValidUuid(id) ? id : null;
    const payload = {
      colors,
      breed,
      species,
      gender,
      features,
      photo,
      note,
      last_seen_location: location,
      last_seen_long: coords?.longitude,
      last_seen_lat: coords?.latitude,
      last_seen_time: new Date().toISOString(),
      linked_sighting_id: linked_sighting_id ?? sightingId,
    } as PetSighting;

    if (petId && isValidUuid(petId)) {
      payload.pet_id = petId;
    }

    setLoading(true);
    const { error, data } = await supabase
      .from("sightings")
      .insert([payload])
      .select("id");

    setLoading(false);
    if (error) {
      log(error.message);
      showMessage({
        message: "Error saving sighting info. Please try again.",
        type: "warning",
        icon: "warning",
      });
      return;
    } else {
      const sightingId = id ?? data[0]["id"];
      showMessage({
        message: "Successfully added pet sighting.",
        type: "success",
        icon: "success",
      });

      if (user) {
        router.navigate(`/owner?sightingId=${sightingId}`);
      } else {
        router.navigate(`/sightings/contact/?sightingId=${sightingId}`);
      }
    }
  }

  async function saveSightingPhoto() {
    if (extra_info.trim()) {
      router.dismissTo("/");
      return;
    }

    if (photo) {
      await uploadImage(photo, saveSighting);
    } else {
      await saveSighting("");
    }
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ flexGrow: 1 }}>
        <View
          style={[
            styles.title,
            styles.header,
            { backgroundColor: theme.colors.primary },
          ]}
        >
          <Text style={styles.headerTitle}>Lost Pet Report</Text>
          <Text style={styles.headerSubtitle}>
            We help bring pets back home
          </Text>
        </View>
        <View style={styles.content}>
          <Text variant="bodyLarge" style={{ alignSelf: "flex-start" }}>
            What did the pet look like? Where was it?
          </Text>
          <View style={[styles.verticallySpaced, styles.mt20]}>
            <TextInput
              label={"Colors"}
              placeholder="Color(s)"
              value={colors}
              onChangeText={setColors}
              mode={"outlined"}
            />
          </View>
          <View style={[styles.verticallySpaced, styles.mt20]}>
            <TextInput
              label={"Breed"}
              placeholder="Breed (if known)"
              value={breed}
              onChangeText={setBreed}
              mode={"outlined"}
            />
          </View>
          <View style={[styles.verticallySpaced, styles.mt20]}>
            <TextInput
              label={"Species"}
              placeholder="Species (Dog/Cat/Hamster)"
              value={species}
              onChangeText={setSpecies}
              mode={"outlined"}
            />
          </View>
          <View style={[styles.verticallySpaced, styles.mt20]}>
            <Text variant="labelLarge">Gender</Text>
            <RadioButton.Group onValueChange={setGender} value={gender}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Text>Female</Text>
                <RadioButton value="Female" />

                <Text>Male</Text>
                <RadioButton value="Male" />
              </View>
            </RadioButton.Group>
          </View>
          <View style={[styles.verticallySpaced, styles.mt20]}>
            <TextInput
              label={"Features"}
              placeholder="Features (Collar, Tag, Size)"
              value={features}
              onChangeText={setFeatures}
              mode={"outlined"}
            />
          </View>

          <View style={[styles.verticallySpaced, styles.mt20]}>
            <TextInput
              label={"Notes"}
              value={note}
              onChangeText={setNote}
              multiline
              mode={"outlined"}
            />
          </View>
          <View style={[styles.verticallySpaced, styles.mt20]}>
            <TextInput
              label={"Last Seen Location"}
              placeholder="Enter Street names, Cross Streets, Signs, Markers"
              value={location}
              onChangeText={setLocation}
              mode={"outlined"}
            />
            <Button
              icon={"map-marker-radius-outline"}
              onPress={() => getCurrentLocationV1(setLocation, setCoords)}
              mode="elevated"
              style={styles.button}
            >
              <Text>
                {location ? "Location saved" : "Use My Current Location"}
              </Text>
            </Button>
          </View>
          <View style={[styles.verticallySpaced, styles.mt20]}>
            {photo ? (
              <Image source={{ uri: photo }} style={styles.preview} />
            ) : (
              <View style={styles.emptyPreview}>
                <Text>Add Photo</Text>
              </View>
            )}

            <Button
              icon="camera"
              mode="elevated"
              onPress={() => pickImage(setPhoto)}
              style={{ marginTop: 10 }}
            >
              {photo ? "Change Photo" : "Upload Photo"}
            </Button>
          </View>

          <View
            style={[styles.verticallySpaced, styles.mt20, { marginTop: 20 }]}
          >
            <Button
              mode="contained"
              disabled={loading || empty}
              onPress={() => saveSightingPhoto()}
            >
              Save
            </Button>
          </View>
          <TextInput
            style={{ height: 0, opacity: 0 }}
            value={extra_info}
            onChangeText={setExtraInfo}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  verticallySpaced: {
    alignSelf: "stretch",
  },
  mt20: {
    marginTop: 10,
  },
  container: {
    flexGrow: 1,
    // paddingHorizontal: 24,
    backgroundColor: "#fff",
    minHeight: "100%",
    paddingBottom: 40,
  },
  secondary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "baseline",
    paddingTop: 4,
    paddingBottom: 4,
  },
  title: {
    marginBottom: 20,
  },
  preview: {
    width: "100%",
    height: 300,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    marginTop: 5,
  },
  button: {
    marginTop: 20,
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
  content: {
    paddingHorizontal: 24,
    alignItems: "center",
  },
  header: {
    backgroundColor: "#714ea9ff",
    padding: 16,
    paddingTop: Platform.OS === "ios" ? 50 : 16,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#BBDEFB",
    marginTop: 4,
  },
});
