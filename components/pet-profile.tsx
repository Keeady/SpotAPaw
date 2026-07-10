import React from "react";
import { View, StyleSheet } from "react-native";
import { Card, Chip, Divider, Icon, Text, useTheme } from "react-native-paper";
import { getIconByAnimalSpecies } from "./util";
import {
  getLastSeenLocationDistance,
  getLastSeenTimeDistance,
} from "./sightings/util";
import { usePermission } from "./Provider/permission-provider";
import { AggregatedSighting } from "@/db/models/sighting";
import { useTranslation } from "react-i18next";
import { useLocaleContext } from "./Provider/locale-provider";
import SightingGallery from "./sightings/gallery";

export function RenderSightingProfile({ pet }: { pet: AggregatedSighting }) {
  const { t } = useTranslation(["petprofile", "translation"]);
  const theme = useTheme();
  const { location: userCurrentLocation } = usePermission();
  const { preferredLanguage } = useLocaleContext();
  const [isVisibleGallery, setIsVisibleGallery] = React.useState(false);

  const species = pet.species.charAt(0).toUpperCase() + pet.species.slice(1);
  return (
    <Card
      style={{
        borderRadius: 20,
        margin: 5,
        marginBottom: 10,
        backgroundColor: "#fff",
      }}
    >
      {pet.photos && pet.photos.length > 0 ? (
        <SightingGallery
          images={pet.photos.map((photo) => ({ uri: photo }))}
          isVisible={isVisibleGallery}
          setIsVisible={setIsVisibleGallery}
          mainPhoto={pet.photos[0]}
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
            backgroundColor: "#eee",
          }}
        >
          <Text>{t("noPhoto", { ns: "translation" })}</Text>
        </View>
      )}
      <Card.Content>
        {pet?.name && (
          <View style={styles.header}>
            <Text variant="labelLarge" style={{ alignSelf: "center" }}>
              {t("name")}
            </Text>
            <Chip
              style={{
                backgroundColor: pet?.name ? "#E6F7E6" : "#FFF4E5",
                marginVertical: 10,
                alignSelf: "flex-start",
                paddingHorizontal: 10,
                paddingVertical: 2,
                borderRadius: 12,
              }}
              textStyle={{
                color: pet?.name ? "#2E7D32" : "#D84315",
                fontWeight: "600",
              }}
              mode="outlined"
            >
              {pet.name}
            </Chip>
          </View>
        )}

        <Divider />
        <View style={styles.line}>
          <View style={styles.header}>
            <Icon
              source={getIconByAnimalSpecies(pet.species)}
              size={25}
              color={theme.colors.primary}
            />
            <Text variant="labelLarge">{t("type")}</Text>
          </View>
          <Text variant="bodyLarge" style={styles.title}>
            {pet.breed} {t(`animal.${species}`, { ns: "translation" })}
          </Text>
        </View>

        <Divider />

        {pet.lastSeenTime && (
          <View style={styles.line}>
            <View style={styles.header}>
              <Icon
                source={"map-marker"}
                size={25}
                color={theme.colors.primary}
              />
              <Text variant="labelLarge">{t("lastSeen")}</Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                paddingHorizontal: 20,
                paddingVertical: 5,
                gap: 8,
                justifyContent: "space-between",
              }}
            >
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                <Icon
                  source={"calendar"}
                  size={25}
                  color={theme.colors.primary}
                />
                <Text variant="bodyLarge">
                  {getLastSeenTimeDistance(pet.lastSeenTime, preferredLanguage)}
                </Text>
              </View>

              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                <Icon
                  source={"map-marker-path"}
                  size={25}
                  color={theme.colors.primary}
                />
                <Text variant="bodyLarge">
                  {userCurrentLocation
                    ? getLastSeenLocationDistance(
                        userCurrentLocation,
                        pet.lastSeenLat,
                        pet.lastSeenLong,
                        t,
                      )
                    : t("noDistance")}
                </Text>
              </View>
            </View>
          </View>
        )}

        <Divider />

        {pet.features && (
          <View style={styles.line}>
            <View style={styles.header}>
              <Icon
                source={"note-multiple"}
                size={25}
                color={theme.colors.primary}
              />
              <Text variant="labelLarge">{t("features")}</Text>
            </View>
            <Text variant="bodyLarge" style={styles.title}>
              {pet.colors && t("colors", "Colors:")} {pet.colors}
              {pet.gender &&
                `\n${t("genderLabel", { ns: "translation" })}: ${t(`gender.${pet.gender}`, { ns: "translation" })}`}
              {pet.age &&
                `\n${t("ageLabel", { ns: "translation" })}: ${t("ageWithCount", { count: pet.age, ns: "translation" })}`}
            </Text>
            <Divider />
            <Text variant="bodyLarge" style={styles.title}>
              {pet.features}
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  line: {
    paddingVertical: 5,
  },
  header: {
    flexDirection: "row",
    alignContent: "center",
    gap: 5,
    alignItems: "center",
  },
  title: {
    paddingHorizontal: 25,
    paddingVertical: 5,
  },
});
