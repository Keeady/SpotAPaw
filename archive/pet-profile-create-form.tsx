import React from "react";
import { View } from "react-native";
import { Button, Card, RadioButton, Text, TextInput } from "react-native-paper";
import { ImagePickerHandler } from "../components/image-picker";

export default function CreatePetProfile({
  profileInfo,
  handleChange,
}: {
  profileInfo?: any;
  handleChange: (f: string, v: string) => void;
}) {
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
          <Button icon="camera" mode="outlined" onPress={() => ImagePickerHandler(handleChange)}>
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
