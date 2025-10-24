import { Pet } from "@/model/pet";
import { router } from "expo-router";
import React from "react";
import { Image, ScrollView, StyleSheet, View } from "react-native";
import { Button, RadioButton, Text, TextInput } from "react-native-paper";
import DatePicker from "../date-picker";
import { getCurrentLocationV2 } from "../get-current-location";
import { ImagePickerHandler } from "../image-picker";

export default function EditPetDetails(
  handleSubmit: () => Promise<void>,
  setProfileInfo: (v: Pet) => void,
  pet?: Pet,
  is_lost?: boolean
) {
  const [isDisabled, setDisabled] = React.useState(false);
  const handleChange = (fieldName: string, fieldValue: string | number) => {
    setProfileInfo((prev) => ({ ...prev, [fieldName]: fieldValue }));
  };
  const [extra_info, setExtraInfo] = React.useState("");

  const onSubmit = async () => {
    try {
      setDisabled(true);
      await handleSubmit();
    } catch {
      setDisabled(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ flexGrow: 1 }}>
        <View style={styles.title}>
          <Text variant="titleLarge">Update Pet Details!</Text>
          <Text variant="titleSmall">
            Help find and protect your furry friends
          </Text>
        </View>
        {is_lost && (
          <View>
            <View style={[styles.verticallySpaced, styles.mt20]}>
              <Text
                variant="bodyLarge"
                style={{ alignSelf: "flex-start", fontWeight: "bold" }}
              >
                Where was your pet last seen?
              </Text>
              <TextInput
                label={"Last Seen Location"}
                placeholder="Enter Street names, Cross Streets, Signs, Markers"
                value={pet?.last_seen_location}
                onChangeText={(v) => handleChange("last_seen_location", v)}
                mode={"outlined"}
              />
              <Button
                icon={"map-marker-radius-outline"}
                onPress={() => getCurrentLocationV2(handleChange)}
                mode="elevated"
                style={styles.button}
              >
                <Text>
                  {pet?.last_seen_location
                    ? "Location saved"
                    : "Use My Current Location"}
                </Text>
              </Button>
            </View>
            <View style={[styles.verticallySpaced, styles.mt20]}>
              <Text
                variant="bodyLarge"
                style={{ alignSelf: "flex-start", fontWeight: "bold" }}
              >
                When was your pet last seen?
              </Text>
              <DatePicker
                dateLabel="Last Seen Date"
                timeLabel="Last Seen Time"
                value={
                  pet?.last_seen_time
                    ? new Date(pet?.last_seen_time)
                    : new Date()
                }
                onChange={(v) => handleChange("last_seen_time", v)}
              />
            </View>
          </View>
        )}
        <Text
          variant="bodyLarge"
          style={{ alignSelf: "flex-start", fontWeight: "bold" }}
        >
          {is_lost ? "Update your Pet Profile" : "Create a Pet Profile"}
        </Text>
        <View>
          <View style={[styles.verticallySpaced, styles.mt20]}>
            <TextInput
              label={"Pet Name"}
              value={pet?.name}
              onChangeText={(v) => handleChange("name", v)}
            />
          </View>
          <View style={[styles.verticallySpaced, styles.mt20]}>
            <TextInput
              label={"Species (e.g., Dog, Cat)"}
              value={pet?.species}
              onChangeText={(v) => handleChange("species", v)}
            />
          </View>
          <View style={[styles.verticallySpaced, styles.mt20]}>
            <TextInput
              label={"Breed"}
              value={pet?.breed}
              onChangeText={(v) => handleChange("breed", v)}
            />
          </View>

          <View style={[styles.verticallySpaced, styles.mt20]}>
            <TextInput
              label={"Age"}
              value={pet?.age?.toString() || ""}
              onChangeText={(v) => handleChange("age", v)}
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.verticallySpaced, styles.mt20]}>
            <Text variant="labelLarge">Gender</Text>
            <RadioButton.Group
              onValueChange={(v) => handleChange("gender", v)}
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
              onChangeText={(v) => handleChange("colors", v)}
            />
          </View>

          <View style={[styles.verticallySpaced, styles.mt20]}>
            <TextInput
              label={"Distinctive Features"}
              value={pet?.features}
              onChangeText={(v) => handleChange("features", v)}
              multiline
            />
          </View>
          <View style={[styles.verticallySpaced, styles.mt20]}>
            <TextInput
              label={"Note"}
              value={pet?.note}
              onChangeText={(v) => handleChange("note", v)}
              multiline
            />
          </View>
          <View style={[styles.verticallySpaced, styles.mt20]}>
            <Text variant="labelLarge">
              {pet?.photo ? "Update Photo" : "Upload Photo (Optional)"}
            </Text>
            <Button
              icon="camera"
              mode="outlined"
              onPress={() => ImagePickerHandler(handleChange)}
            >
              Choose File
            </Button>
            {pet?.photo ? (
              <Image source={{ uri: pet?.photo }} style={styles.preview} />
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
          <Button
            mode="contained"
            onPress={() => {
              if (extra_info) {
                return router.dismissTo("/");
              }

              onSubmit();
            }}
            disabled={isDisabled}
          >
            {is_lost ? "Update Pet" : "Save Pet"}
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
    marginBottom: 20,
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
