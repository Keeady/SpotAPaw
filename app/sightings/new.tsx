import { getCurrentLocationV1 } from "@/components/get-current-location";
import DefaultPageHeader from "@/components/header/default-header";
import { supabase } from "@/components/supabase-client";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, View } from "react-native";
import { showMessage } from "react-native-flash-message";
import { Button, Text, TextInput } from "react-native-paper";

export default function Sighting() {
  const { id, petId } = useLocalSearchParams();

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
  const [empty, setEmpty] = useState(true);

  const router = useRouter();

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  useEffect(() => {
    if (colors && species && features && location) {
      setEmpty(false);
    } else {
      setEmpty(true);
    }
  }, [location, colors, species, features]);

  useEffect(() => {
    if (id) {
      setLoading(true);
      supabase
        .from("sightings")
        .select("*")
        .eq("id", id)
        .single()
        .then(({ data, error }) => {
          console.log("data", data);
          console.log("Error", error);
          setColors(data.colors);
          setBreed(data.breed);
          setSpecies(data.species);
          setGender(data.gender);
          setFeatures(data.features);
        });
    }

    setLoading(false);
  }, [id]);

  async function saveSighting() {
    console.log("save");
    if (extra_info.trim()) {
      router.navigate("/");
      return;
    }

    const payload = {
      colors,
      breed,
      species,
      gender,
      features,
      photo,
      last_seen_location: location,
      last_seen_long: coords?.longitude,
      last_seen_lat: coords?.latitude,
      last_seen_time: new Date().toISOString(),
    };

    if (petId) {
      payload.pet_id = petId;
    }
    setLoading(true);
    const { error } = await supabase.from("sightings").insert([payload]);
    setLoading(false);
    console.log("err", error);
    if (error) {
      showMessage({
        message: "Error saving sighting info. Please try again.",
        type: "warning",
        icon: "warning",
      });
      return;
    } else {
      showMessage({
        message: "Successfully added pet sighting.",
        type: "success",
        icon: "success",
      });
    }

    router.navigate("/sightings/contact");
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ flexGrow: 1 }}>
        <DefaultPageHeader />
        <View style={styles.title}>
          <Text variant="titleLarge">Report a Pet Sighting!</Text>
          <Text variant="titleSmall">
            Help find and protect our furry friends
          </Text>
        </View>
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
          <TextInput
            label={"Gender"}
            placeholder="Gender (Female, Male)"
            value={gender}
            onChangeText={setGender}
            mode={"outlined"}
          />
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
          <Text variant="labelLarge">
            {photo ? "Change Photo" : "Upload Photo (Optional)"}
          </Text>
          <Button icon="camera" mode="outlined" onPress={pickImage}>
            Choose File
          </Button>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.preview} />
          ) : (
            <View style={styles.emptyPreview}>
              <Text>No Photo</Text>
            </View>
          )}
        </View>
        <TextInput
          style={{ height: 0, opacity: 0 }}
          value={extra_info}
          onChangeText={setExtraInfo}
        />
        <View style={[styles.verticallySpaced, styles.mt20]}>
          <Button
            mode="contained"
            disabled={loading || empty}
            onPress={() => saveSighting()}
          >
            Save
          </Button>
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
    paddingHorizontal: 24,
    backgroundColor: "#fff",
    minHeight: "100%",
    paddingBottom: 40,
    alignContent: "center",
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
    alignSelf: "center",
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
});
