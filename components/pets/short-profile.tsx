import { Pet } from "@/model/pet";
import React from "react";
import { Image, View } from "react-native";
import { Card, Divider, Text } from "react-native-paper";

type ShortProfileProp = {
  pet: Pet;
};

export default function RenderShortProfile({ pet }: ShortProfileProp) {
  return (
    <Card
      style={{
        borderRadius: 20,
        margin: 5,
        marginBottom: 20,
        backgroundColor: "#fff",
      }}
    >
      {pet.photo ? (
        <Image
          source={{ uri: pet.photo }}
          resizeMode="cover"
          style={{
            width: "100%",
            height: 300,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
          }}
        />
      ) : (
        <View
          style={{
            width: "100%",
            height: 300,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#ddd",
          }}
        >
          <Text>No photo</Text>
        </View>
      )}
      <Card.Content style={{ alignItems: "center" }}>
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>{pet.name}</Text>
        <Divider />
        <Text style={{ fontSize: 16, color: "#555", marginTop: 2 }}>
          {pet.breed}
        </Text>
        <Text style={{ fontSize: 16, color: "#555", marginTop: 2 }}>
          {pet.age} years old
        </Text>
      </Card.Content>
    </Card>
  );
}
