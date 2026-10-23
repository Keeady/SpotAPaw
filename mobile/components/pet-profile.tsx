import React from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import { Card, Chip, Icon, Text, useTheme } from "react-native-paper";
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

const TABLET_BREAKPOINT = 600; // dp: phones below, tablets/iPads at or above

// pet.colors may be a comma-separated string or an array
function toColorList(colors: unknown): string[] {
  if (!colors) return [];
  if (Array.isArray(colors)) return colors.map(String).filter(Boolean);
  return String(colors)
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
}

function genderIcon(gender?: string) {
  if (gender === "Male") return "gender-male";
  if (gender === "Female") return "gender-female";
  return "paw";
}

function Detail({
  label,
  width,
  children,
}: {
  label: string;
  width: `${number}%`;
  children: React.ReactNode;
}) {
  const theme = useTheme();
  return (
    <View style={[styles.detail, { width }]}>
      <Text
        variant="labelSmall"
        style={{
          color: theme.colors.onSurfaceVariant,
          textTransform: "uppercase",
        }}
      >
        {label}
      </Text>
      <View style={styles.detailValue}>{children}</View>
    </View>
  );
}

export function RenderSightingProfile({ pet }: { pet: AggregatedSighting }) {
  const { t } = useTranslation(["petprofile", "translation"]);
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const { location: userCurrentLocation } = usePermission();
  const { preferredLanguage } = useLocaleContext();
  const [isVisibleGallery, setIsVisibleGallery] = React.useState(false);

  const isWide = width >= TABLET_BREAKPOINT;
  // 2 columns on phones, 4 on tablets/iPads
  const detailWidth: `${number}%` = isWide ? "25%" : "50%";

  const speciesKey = pet.species.charAt(0).toUpperCase() + pet.species.slice(1);
  const speciesLabel = t(`animal.${speciesKey}`, { ns: "translation" });
  const colorList = toColorList(pet.colors);
  const hasPhotos = !!pet.photos && pet.photos.length > 0;

  const labelStyle = {
    color: theme.colors.onSurfaceVariant,
    textTransform: "uppercase" as const,
  };

  return (
    <Card
      mode="outlined"
      style={[styles.card, { backgroundColor: theme.colors.surface }]}
    >
      <View style={[styles.content, isWide && styles.contentWide]}>
        {/* Photos (left on tablets, top on phones) */}
        <View style={[styles.photoWrap, isWide ? styles.photoWide : styles.photoNarrow]}>
          {hasPhotos ? (
            <SightingGallery
              images={pet.photos!.map((photo) => ({ uri: photo }))}
              isVisible={isVisibleGallery}
              setIsVisible={setIsVisibleGallery}
              mainPhoto={pet.photos![0]}
            />
          ) : (
            <View
              style={[
                styles.photoPlaceholder,
                { backgroundColor: theme.colors.surfaceVariant },
              ]}
            >
              <Icon
                source="image-off-outline"
                size={isWide ? 56 : 44}
                color={theme.colors.onSurfaceVariant}
              />
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                {t("noPhoto", { ns: "translation" })}
              </Text>
            </View>
          )}
        </View>

        {/* Details (right on tablets, below on phones) */}
        <View style={styles.details}>
          {/* Title row: name + species chip */}
          <View style={styles.titleRow}>
            <Text variant="titleLarge" style={styles.title} numberOfLines={2}>
              {pet.name || speciesLabel}
            </Text>
            {!!pet.name && (
              <Chip
                compact
                icon={getIconByAnimalSpecies(pet.species)}
                style={{ backgroundColor: theme.colors.primaryContainer }}
                textStyle={{ color: theme.colors.onPrimaryContainer }}
              >
                {speciesLabel}
              </Chip>
            )}
          </View>

          {/* Last seen: time + distance */}
          {!!pet.lastSeenTime && (
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Icon
                  source="calendar-clock-outline"
                  size={16}
                  color={theme.colors.onSurfaceVariant}
                />
                <Text
                  variant="bodyMedium"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  {t("lastSeen")}{" "}
                  {getLastSeenTimeDistance(pet.lastSeenTime, preferredLanguage)}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Icon
                  source="map-marker-path"
                  size={16}
                  color={theme.colors.onSurfaceVariant}
                />
                <Text
                  variant="bodyMedium"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
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
          )}

          {/* Breed / species / gender / age */}
          <View style={styles.grid}>
            {!!pet.breed && (
              <Detail label={t("breed", "Breed")} width={detailWidth}>
                <Text variant="bodyMedium">{pet.breed}</Text>
              </Detail>
            )}
            <Detail label={t("type")} width={detailWidth}>
              <Icon
                source={getIconByAnimalSpecies(pet.species)}
                size={16}
                color={theme.colors.primary}
              />
              <Text variant="bodyMedium"> {speciesLabel}</Text>
            </Detail>
            {!!pet.gender && (
              <Detail
                label={t("genderLabel", { ns: "translation" })}
                width={detailWidth}
              >
                <Icon
                  source={genderIcon(pet.gender)}
                  size={16}
                  color={theme.colors.onSurface}
                />
                <Text variant="bodyMedium">
                  {" "}
                  {t(`gender.${pet.gender}`, { ns: "translation" })}
                </Text>
              </Detail>
            )}
            {!!pet.age && (
              <Detail
                label={t("ageLabel", { ns: "translation" })}
                width={detailWidth}
              >
                <Text variant="bodyMedium">
                  {t("ageWithCount", { count: pet.age, ns: "translation" })}
                </Text>
              </Detail>
            )}
          </View>

          {/* Colors */}
          {colorList.length > 0 && (
            <View style={styles.section}>
              <Text variant="labelSmall" style={labelStyle}>
                {t("colors", "Colors")}
              </Text>
              <View style={styles.chips}>
                {colorList.map((c) => (
                  <Chip key={c} compact mode="outlined">
                    {c}
                  </Chip>
                ))}
              </View>
            </View>
          )}

          {/* Features */}
          {!!pet.features && (
            <View style={styles.section}>
              <Text variant="labelSmall" style={labelStyle}>
                {t("features")}
              </Text>
              <Text variant="bodyMedium">{pet.features}</Text>
            </View>
          )}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    maxWidth: 900, // keeps the card readable on large iPads
    alignSelf: "center",
    borderRadius: 16,
    margin: 5,
    marginBottom: 10,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  contentWide: {
    flexDirection: "row",
    gap: 24,
    padding: 20,
  },
  photoWrap: {
    borderRadius: 12,
    overflow: "hidden",
  },
  photoNarrow: {
    width: "100%",
  },
  photoWide: {
    width: 240,
    alignSelf: "flex-start",
  },
  photoPlaceholder: {
    width: "100%",
    aspectRatio: 4 / 3,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  details: {
    flex: 1,
    gap: 14,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  title: {
    fontWeight: "700",
    flexShrink: 1,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 16,
    rowGap: 4,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 12,
  },
  detail: {
    paddingRight: 8,
  },
  detailValue: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  section: {
    gap: 6,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
});
