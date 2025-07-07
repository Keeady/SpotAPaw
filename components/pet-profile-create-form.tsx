import React from "react";
import { ScrollView } from "react-native-gesture-handler";
import { Button, Card, RadioButton, Text, TextInput } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { View } from "react-native";

export default function CreatePetProfile({
  profileInfo,
  handleChange,
}: {
  profileInfo?: any;
  handleChange: (f: string, v: string) => void;
}) {
  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      handleChange("photo", result.assets[0].uri);
    }
  };

  return (
    <Card>
      <Card.Content>
        <Text>Create Pet Profile</Text>
        <TextInput
          label={"Pet Name"}
          value={profileInfo?.name}
          onChangeText={(v) => handleChange("name", v)}
        />
        <TextInput
          label={"Species (e.g., Dog, Cat)"}
          value={profileInfo?.species}
          onChangeText={(v) => handleChange("species", v)}
        />
        <TextInput
          label={"Breed"}
          value={profileInfo?.breed}
          onChangeText={(v) => handleChange("breed", v)}
        />
        <TextInput
          label={"Age"}
          value={profileInfo?.age}
          onChangeText={(v) => handleChange("age", v)}
        />

        <RadioButton.Group
          onValueChange={(v) => handleChange("gender", v)}
          value={profileInfo?.gender}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text>Female</Text>
            <RadioButton value="Female" />

            <Text>Male</Text>
            <RadioButton value="Male" />
          </View>
        </RadioButton.Group>
        <TextInput
          label={"Colors"}
          value={profileInfo?.colors}
          onChangeText={(v) => handleChange("colors", v)}
        />
        <TextInput
          label={"Distinctive Features"}
          value={profileInfo?.features}
          onChangeText={(v) => handleChange("features", v)}
          multiline
        />

        <View>
          <Text variant="bodyLarge">Upload Photos</Text>
          <Button icon="camera" mode="outlined" onPress={pickImage}>
            Choose File
          </Button>
        </View>
      </Card.Content>
      <Card.Actions>
        <Button mode="contained" onPress={() => console.log("Pressed")}>
          Save Pet
        </Button>
      </Card.Actions>
    </Card>
  );
}
