import React from "react";
import { Button, Card, Text, TextInput } from "react-native-paper";

export default function CreateOwnerProfile({
  profileInfo,
  handleChange,
}: {
  profileInfo: any;
  handleChange: (f: string, v: string) => void;
}) {
  return (
    <Card>
      <Card.Content>
        <Text>Create Owner Profile</Text>
        <TextInput
          label={"First Name"}
          value={profileInfo.firstName}
          onChangeText={(v) => handleChange("firstName", v)}
        />
        <TextInput
          label={"Last Name"}
          value={profileInfo.lastName}
          onChangeText={(v) => handleChange("lastName", v)}
        />
        <TextInput
          label={"Phone Number"}
          value={profileInfo.phone}
          onChangeText={(v) => handleChange("phone", v)}
        />
        <TextInput
          label={"Email"}
          value={profileInfo.email}
          onChangeText={(v) => handleChange("email", v)}
        />
      </Card.Content>
      <Card.Actions>
        <Button mode="contained" onPress={() => console.log("Pressed")}>
          Save Contact
        </Button>
      </Card.Actions>
    </Card>
  );
}
