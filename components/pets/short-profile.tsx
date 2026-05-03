import React from "react";
import { Image, View } from "react-native";
import { Card, Divider, Text } from "react-native-paper";
import { SightingPet } from "../wizard/wizard-interface";
import { useTranslation } from "react-i18next";

type ShortProfileProp = {
  pet: SightingPet;
};

export default function RenderShortProfile({ pet }: ShortProfileProp) {
  const { t } = useTranslation(["petprofile", "translation"]);
  return (
    <Card
      style={{
        borderRadius: 20,
        margin: 5,
        marginBottom: 20,
        backgroundColor: "#fff",
        paddingVertical: 12,
      }}
    >
      {pet.photo ? (
        <Image
          source={{ uri: pet.photo }}
          resizeMode="contain"
          style={{
            width: "100%",
            height: "auto",
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            aspectRatio: 1.5,
          }}
        />
      ) : (
        <View
          style={{
            // width: "100%",
            height: 300,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#ddd",
            margin: 12,
          }}
        >
          <Text>{t("noPhoto", "No photo", { ns: "translation" })}</Text>
        </View>
      )}
      <Card.Content style={{ alignItems: "center" }}>
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>{pet.name}</Text>
        <Divider />
        <Text style={{ fontSize: 16, color: "#555", marginTop: 2 }}>
          {pet.breed}
        </Text>
        <Text style={{ fontSize: 16, color: "#555", marginTop: 2 }}>
          {pet.age
            ? t("ageWithCount", "{{age}} years old", {
                count: pet.age,
                ns: "translation",
              })
            : ""}
        </Text>
      </Card.Content>
    </Card>
  );
}
