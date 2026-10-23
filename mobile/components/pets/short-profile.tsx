import React from "react";
import { Image, StyleSheet, useWindowDimensions, View } from "react-native";
import { Card, Divider, Icon, Text, useTheme } from "react-native-paper";
import { SightingPet } from "../wizard/wizard-interface";
import { useTranslation } from "react-i18next";

type ShortProfileProp = {
  pet: SightingPet;
};

const TABLET_BREAKPOINT = 600; // dp: phones below, tablets/iPads at or above

export default function RenderShortProfile({ pet }: ShortProfileProp) {
  const { t } = useTranslation(["petprofile", "translation"]);
  const theme = useTheme();
  const { width } = useWindowDimensions();

  const isWide = width >= TABLET_BREAKPOINT;
  return (
    <View style={styles.page}>
      <Card
        mode="outlined"
        style={[styles.card, { backgroundColor: theme.colors.surface }]}
      >
        <View style={[styles.content, isWide && styles.contentWide]}>
          {/* Photos (left on tablets, top on phones) */}
          <View
            style={[
              styles.photoWrap,
              isWide ? styles.photoWide : styles.photoNarrow,
            ]}
          >
            {pet.photos && pet.photos.length > 0 ? (
              <Image
                source={{ uri: pet.photos[0] }}
                resizeMode="contain"
                style={{
                  width: "100%",
                  height: "auto",
                  borderTopLeftRadius: 12,
                  borderTopRightRadius: 12,
                  aspectRatio: 1.5,
                }}
                testID="pet-photos"
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
                  {t("noPhoto", "No Photo", { ns: "translation" })}
                </Text>
              </View>
            )}
          </View>
          {/* Details (right on tablets, below on phones) */}
          <View style={styles.details}>
            <View style={styles.titleRow}>
              <Text variant="titleLarge" style={styles.title} numberOfLines={2}>
                {pet.name}
              </Text>
              <Text variant="bodyMedium">{pet.breed}</Text>
              <Text variant="bodyMedium">
                {pet.age
                  ? t("ageWithCount", `${pet.age} years old`, {
                      count: pet.age,
                      ns: "translation",
                    })
                  : ""}
              </Text>
            </View>
          </View>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  page: {
    width: "100%",
    maxWidth: 900, // keeps the card readable on large iPads
    alignSelf: "center",
    marginVertical: 10,
  },
  card: {
    borderRadius: 16,
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
    alignItems: "center",
    alignSelf: "center",
    flexDirection: "column",
  },
  titleRow: {
    flexDirection: "column",
    alignItems: "center",
    alignSelf: "center",

    flexWrap: "wrap",
    gap: 8,
  },
  title: {
    fontWeight: "700",
    flexShrink: 1,
  },
});
