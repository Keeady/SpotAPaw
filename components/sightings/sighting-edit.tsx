import { Pet } from "@/model/pet";
import { PetSighting } from "@/model/sighting";
import { router } from "expo-router";
import React, { useState } from "react";
import { Image, Platform, ScrollView, StyleSheet, View } from "react-native";
import {
  Button,
  RadioButton,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import DatePicker from "../date-picker";
import { ImagePickerHandler } from "../image-picker";
import ShowLocationControls from "../location-util";

export default function EditPetSightingDetails(
  handleSubmit: () => Promise<void>,
  setProfileInfo: React.Dispatch<React.SetStateAction<Pet | undefined>>,
  setSightingInfo: React.Dispatch<
    React.SetStateAction<PetSighting | undefined>
  >,
  pet?: Pet,
  sighting?: PetSighting,
  is_lost?: boolean
) {
  const theme = useTheme();
  const [extra_info, setExtraInfo] = useState("");

  const handleProfileChange = (
    fieldName: string,
    fieldValue: string | number
  ) => {
    setProfileInfo((prev) => ({ ...prev, [fieldName]: fieldValue }));
  };

  const handleSightingChange = (
    fieldName: string,
    fieldValue: string | number
  ) => {
    setSightingInfo((prev) => ({ ...prev, [fieldName]: fieldValue }));
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ flexGrow: 1 }}>
        <View
          style={[styles.header, { backgroundColor: theme.colors.primary }]}
        >
          <Text style={styles.headerTitle}>Report a Pet Sighting!</Text>
          <Text style={styles.headerSubtitle}>
            Help find and protect your furry friends
          </Text>
        </View>
        <View style={styles.content}>
          {is_lost && (
            <>
              <View style={[styles.verticallySpaced, styles.mt20]}>
                <Text
                  variant="bodyLarge"
                  style={{ alignSelf: "flex-start", fontWeight: "bold" }}
                >
                  Where was your pet last seen?
                </Text>
                <ShowLocationControls handleChange={handleSightingChange} />
              </View>
              <View style={[styles.verticallySpaced, styles.mt20]}>
                <Text
                  variant="bodyLarge"
                  style={{
                    alignSelf: "flex-start",
                    fontWeight: "bold",
                    marginBottom: 10,
                  }}
                >
                  When was your pet last seen?
                </Text>
                <DatePicker
                  dateLabel="Last Seen Date"
                  timeLabel="Last Seen Time"
                  value={
                    sighting?.last_seen_time
                      ? new Date(sighting?.last_seen_time)
                      : new Date()
                  }
                  onChange={(v) =>
                    handleSightingChange("last_seen_time", v.toISOString())
                  }
                />
              </View>
            </>
          )}

          <Text
            variant="bodyLarge"
            style={{
              alignSelf: "flex-start",
              fontWeight: "bold",
              marginBottom: 10,
            }}
          >
            What does your pet look like?
          </Text>

          <View style={[styles.verticallySpaced, styles.mt20]}>
            <TextInput
              label={"Pet Name"}
              value={pet?.name}
              onChangeText={(v) => handleProfileChange("name", v)}
            />
          </View>
          <View style={[styles.verticallySpaced, styles.mt20]}>
            <TextInput
              label={"Species (e.g., Dog, Cat)"}
              value={pet?.species}
              onChangeText={(v) => handleProfileChange("species", v)}
            />
          </View>
          <View style={[styles.verticallySpaced, styles.mt20]}>
            <TextInput
              label={"Breed"}
              value={pet?.breed}
              onChangeText={(v) => handleProfileChange("breed", v)}
            />
          </View>

          <View style={[styles.verticallySpaced, styles.mt20]}>
            <TextInput
              label={"Age"}
              value={pet?.age?.toString() || ""}
              onChangeText={(v) => handleProfileChange("age", v)}
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.verticallySpaced, styles.mt20]}>
            <Text variant="labelLarge">Gender</Text>
            <RadioButton.Group
              onValueChange={(v) => handleProfileChange("gender", v)}
              value={pet?.gender || ""}
            >
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
              label={"Colors"}
              value={pet?.colors}
              onChangeText={(v) => handleProfileChange("colors", v)}
            />
          </View>

          <View style={[styles.verticallySpaced, styles.mt20]}>
            <TextInput
              label={"Distinctive Features"}
              value={pet?.features}
              onChangeText={(v) => handleProfileChange("features", v)}
              multiline
            />
          </View>
          <View style={[styles.verticallySpaced, styles.mt20]}>
            <TextInput
              label={"Notes"}
              value={pet?.note}
              onChangeText={(v) => handleProfileChange("note", v)}
              multiline
            />
          </View>
          <View style={[styles.verticallySpaced, styles.mt20]}>
            {pet?.photo ? (
              <Image source={{ uri: pet?.photo }} style={styles.preview} />
            ) : (
              <View style={styles.emptyPreview}>
                <Text>Add Photo</Text>
              </View>
            )}

            <Button
              icon="camera"
              mode="elevated"
              onPress={() => ImagePickerHandler(handleProfileChange)}
              style={{ marginTop: 10 }}
            >
              {pet?.photo ? "Update Photo" : "Upload Photo"}
            </Button>
          </View>

          <View
            style={[styles.verticallySpaced, styles.mt20, { marginTop: 20 }]}
          >
            <Button
              mode="contained"
              onPress={() => {
                if (extra_info) {
                  return router.dismissTo("/");
                }
                handleSubmit();
              }}
            >
              {is_lost ? "Update Pet" : "Save Pet"}
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
    marginBottom: 20,
  },
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    minHeight: "100%",
    paddingBottom: 40,
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
    paddingHorizontal: 16,
    alignItems: "center",
  },
  header: {
    backgroundColor: "#714ea9ff",
    padding: 16,
    paddingTop: Platform.OS === "ios" ? 50 : 16,
    alignItems: "center",
    marginBottom: 20,
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
