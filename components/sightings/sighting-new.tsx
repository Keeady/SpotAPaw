import { supabase } from "@/components/supabase-client";
import { PetSighting } from "@/model/sighting";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Image, Platform, ScrollView, StyleSheet, View } from "react-native";
import { showMessage } from "react-native-flash-message";
import {
  Button,
  RadioButton,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { pickImage } from "../image-picker";
import useUploadPetImageUrl from "../image-upload";
import { getLastSeenLocation, isValidUuid } from "../util";
import { log } from "../logs";
import DatePicker from "../date-picker";
import ShowLocationControls from "../location-util";
import AppConstants, { SIGHTING_AI_ENABLED_KEY } from "../constants";
import { usePetAnalyzer } from "../analyzer/use-pet-image-analyzer";
import { AnalysisResponse } from "../analyzer/types";
import AIAnalysisBanner, { AIFieldAnalysisBanner } from "../analyzer/ai-banner";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function CreateNewSighting() {
  const theme = useTheme();
  const { id: linked_sighting_id, petId } = useLocalSearchParams<{
    id: string;
    petId: string;
  }>();

  const [loading, setLoading] = useState(false);
  const [colors, setColors] = useState("");
  const [breed, setBreed] = useState("");
  const [species, setSpecies] = useState("");
  const [gender, setGender] = useState("");
  const [features, setFeatures] = useState("");
  const [photo, setPhoto] = useState("");
  const [extra_info, setExtraInfo] = useState("");
  const [note, setNote] = useState("");
  const [empty, setEmpty] = useState(true);
  const [lastSeenTime, setLastSeenTime] = useState(new Date().toISOString());
  const [size, setPetSize] = useState("");

  const [lastSeenLocation, setLastSeenLocation] = useState<string>("");
  const [lastSeenLocationLng, setLastSeenLocationLng] = useState<number>(0);
  const [lastSeenLocationLat, setLastSeenLocationLat] = useState<number>(0);

  const [aiGenerated, setAiGenerated] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);

  const router = useRouter();
  const uploadImage = useUploadPetImageUrl();

  const onImageAnalyzeSuccess = useCallback(() => {
    (data: AnalysisResponse) => {
      if ("pets" in data && data.pets.length > 0) {
        const petInfo = data.pets[0];
        if (petInfo.species) {
          setSpecies(petInfo.species);
        }

        if (petInfo.breed) {
          setBreed(petInfo.breed);
        }

        if (petInfo.colors) {
          setColors(petInfo.colors.join(", "));
        }

        if (petInfo.distinctive_features) {
          setFeatures(petInfo.distinctive_features.join(","));
        }

        if (petInfo.size) {
          setPetSize(petInfo.size);
        }
      }
    };
  }, []);

  const { analyze, loading: loadingAnalyzer } = usePetAnalyzer({
    apiKey: AppConstants.EXPO_GOOGLE_GENAI_API_KEY,
    onSuccess: onImageAnalyzeSuccess,
    onError: (error: Error) => {
      log(error.message);
      setAiGenerated(false);
    },
  });

  useEffect(() => {
    if (
      !linked_sighting_id &&
      colors &&
      species &&
      features &&
      (lastSeenLocation || (lastSeenLocationLat && lastSeenLocationLng))
    ) {
      setEmpty(false);
    } else if (
      linked_sighting_id &&
      (lastSeenLocation || (lastSeenLocationLat && lastSeenLocationLng))
    ) {
      setEmpty(false);
    } else {
      setEmpty(true);
    }
  }, [
    lastSeenLocation,
    lastSeenLocationLat,
    lastSeenLocationLng,
    colors,
    species,
    features,
    linked_sighting_id,
  ]);

  const runImageAnalyzer = useCallback(
    async (photo: string) => {
      const aiFeatureEnabled = await AsyncStorage.getItem(
        SIGHTING_AI_ENABLED_KEY,
      );

      if (aiFeatureEnabled === "true") {
        setAiGenerated(true);
        await analyze(photo);
      }
    },
    [analyze],
  );

  useEffect(() => {
    if (photo) {
      runImageAnalyzer(photo);
    }
  }, [photo]);

  async function saveSighting(photo: string) {
    const sightingId = isValidUuid(linked_sighting_id)
      ? linked_sighting_id
      : null;
    const lastSeenFormatted = await getLastSeenLocation(
      lastSeenLocation,
      lastSeenLocationLat,
      lastSeenLocationLng,
    );
    const payload = {
      colors,
      breed,
      species,
      gender,
      features,
      photo,
      note,
      last_seen_location: lastSeenFormatted,
      last_seen_long: lastSeenLocationLng,
      last_seen_lat: lastSeenLocationLat,
      last_seen_time: lastSeenTime,
      linked_sighting_id: sightingId,
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
        statusBarHeight: 50,
      });
      return;
    } else {
      const sightingId = data[0]["id"];
      showMessage({
        message: "Successfully added pet sighting.",
        type: "success",
        icon: "success",
        statusBarHeight: 50,
      });

      router.navigate(`/sightings/contact/?sightingId=${sightingId}`);
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
      ref={scrollViewRef}
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
          <View style={[styles.verticallySpaced, styles.mt10]}>
            <Text
              variant="bodyLarge"
              style={{
                alignSelf: "flex-start",
                fontWeight: "bold",
                marginBottom: 10,
              }}
            >
              When was the pet last seen?
            </Text>
            <DatePicker
              dateLabel="Last Seen Date"
              timeLabel="Last Seen Time"
              value={new Date()}
              onChange={(v) => setLastSeenTime(v.toISOString())}
            />
          </View>
          <View style={[styles.verticallySpaced, styles.mt10]}>
            <Text
              variant="bodyLarge"
              style={{ alignSelf: "flex-start", fontWeight: "bold" }}
            >
              Where was the pet last seen?
            </Text>
            <ShowLocationControls
              handleChange={(fieldName, fieldValue: string | number) => {
                if (fieldName === "last_seen_long") {
                  setLastSeenLocationLng(fieldValue as number);
                } else if (fieldName === "last_seen_lat") {
                  setLastSeenLocationLat(fieldValue as number);
                } else if (fieldName === "last_seen_location") {
                  setLastSeenLocation(fieldValue as string);
                }

                setTimeout(() => {
                  scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 500);
              }}
            />
          </View>

          <View style={[styles.verticallySpaced, styles.mb10, styles.mt20]}>
            <Text
              variant="bodyLarge"
              style={{ alignSelf: "flex-start", fontWeight: "bold" }}
            >
              Add sighting photo:
            </Text>
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

            {aiGenerated && (
              <View style={{ marginTop: 20 }}>
                <AIAnalysisBanner
                  loading={loadingAnalyzer}
                  onSettingsPress={() => router.navigate("/(app)/my-settings")}
                />
              </View>
            )}
          </View>

          {!linked_sighting_id && (
            <>
              <Text
                variant="bodyLarge"
                style={{
                  alignSelf: "flex-start",
                  fontWeight: "bold",
                  marginTop: 20,
                }}
              >
                What did the pet look like?
              </Text>
              <View style={[styles.verticallySpaced, styles.mt10]}>
                <AIFieldAnalysisBanner
                  loading={loadingAnalyzer}
                  aiGenerated={aiGenerated}
                />

                <TextInput
                  label={"Colors"}
                  placeholder="Color(s)"
                  value={colors}
                  onChangeText={setColors}
                  mode={"outlined"}
                />
              </View>
              <View style={[styles.verticallySpaced, styles.mt10]}>
                <AIFieldAnalysisBanner
                  loading={loadingAnalyzer}
                  aiGenerated={aiGenerated}
                />

                <TextInput
                  label={"Species"}
                  placeholder="Species (Dog/Cat/Hamster/Rabbit/Snake)"
                  value={species}
                  onChangeText={setSpecies}
                  mode={"outlined"}
                />
              </View>
              <View style={[styles.verticallySpaced, styles.mt10]}>
                <AIFieldAnalysisBanner
                  loading={loadingAnalyzer}
                  aiGenerated={aiGenerated}
                />

                <TextInput
                  label={"Breed"}
                  placeholder="Breed (if known)"
                  value={breed}
                  onChangeText={setBreed}
                  mode={"outlined"}
                />
              </View>
              <View style={[styles.verticallySpaced, styles.mt10]}>
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

              <View style={[styles.verticallySpaced, styles.mt10]}>
                <AIFieldAnalysisBanner
                  loading={loadingAnalyzer}
                  aiGenerated={aiGenerated}
                />

                <TextInput
                  label={"Size"}
                  placeholder="Small/Medium/Large"
                  value={size}
                  onChangeText={setPetSize}
                  mode={"outlined"}
                />
              </View>

              <View style={[styles.verticallySpaced, styles.mt10]}>
                <AIFieldAnalysisBanner
                  loading={loadingAnalyzer}
                  aiGenerated={aiGenerated}
                />

                <TextInput
                  label={"Features"}
                  placeholder="Features (Collar, Tag, Size)"
                  value={features}
                  onChangeText={setFeatures}
                  mode={"outlined"}
                />
              </View>
            </>
          )}

          <View style={[styles.verticallySpaced, styles.mt10]}>
            <Text
              variant="bodyLarge"
              style={{
                alignSelf: "flex-start",
                fontWeight: "bold",
                marginTop: 10,
              }}
            >
              Additional Details:
            </Text>
            <TextInput
              label={"Notes"}
              value={note}
              onChangeText={setNote}
              multiline
              mode={"outlined"}
            />
          </View>

          <View
            style={[styles.verticallySpaced, styles.mt10, { marginTop: 20 }]}
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
    marginTop: 20,
  },
  mt10: {
    marginTop: 10,
  },
  mb10: {
    marginBottom: 10,
  },
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    minHeight: "100%",
    paddingBottom: 40,
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
