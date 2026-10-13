import React from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { Card, Chip, Icon, Text, useTheme } from "react-native-paper";

export type Sighting = {
  id: string;
  petName: string;
  petType: string; // e.g. "Dog", "Cat"
  breed: string;
  species: string;
  lastSeenAt: string; // ISO date string
  distanceMiles: number;
  colors: string[];
  gender: "male" | "female" | "unknown";
  age: string; // e.g. "3 years", "Puppy"
  features?: string; // distinguishing marks, collar, etc.
};

type Props = {
  sighting: Sighting;
  onPress?: () => void;
};

const TABLET_BREAKPOINT = 600; // dp; phones are below, tablets/iPads at or above

const GENDER = {
  male: { label: "Male", icon: "gender-male" },
  female: { label: "Female", icon: "gender-female" },
  unknown: { label: "Unknown", icon: "help-circle-outline" },
} as const;

function Detail({
  label,
  children,
  width,
}: {
  label: string;
  children: React.ReactNode;
  width: `${number}%`;
}) {
  const theme = useTheme();
  return (
    <View style={[styles.detail, { width }]}>
      <Text
        variant="labelSmall"
        style={{ color: theme.colors.onSurfaceVariant, textTransform: "uppercase" }}
      >
        {label}
      </Text>
      <View style={styles.detailValue}>{children}</View>
    </View>
  );
}

export default function SightingCardNative({ sighting, onPress }: Props) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const isWide = width >= TABLET_BREAKPOINT;

  const {
    petName,
    petType,
    breed,
    species,
    lastSeenAt,
    distanceMiles,
    colors,
    gender,
    age,
    features,
  } = sighting;

  const lastSeen = new Date(lastSeenAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const g = GENDER[gender];

  // 2 columns on phones, 4 on tablets/iPads
  const detailWidth: `${number}%` = isWide ? "25%" : "50%";

  return (
    <Card
      mode="outlined"
      onPress={onPress}
      accessibilityLabel={`${petName}, ${petType}, last seen ${lastSeen}, ${distanceMiles.toFixed(1)} miles away`}
      style={[styles.card, { backgroundColor: theme.colors.surface }]}
    >
      <View style={[styles.content, isWide && styles.contentWide]}>
        {/* Photo gallery placeholder (left on tablets, top on phones) */}
        <View
          style={[
            styles.photoPlaceholder,
            isWide ? styles.photoWide : styles.photoNarrow,
            { backgroundColor: theme.colors.surfaceVariant },
          ]}
          accessibilityLabel="Photo placeholder"
        >
          <Icon
            source="image-off-outline"
            size={isWide ? 56 : 44}
            color={theme.colors.onSurfaceVariant}
          />
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            No photos
          </Text>
        </View>

        {/* Details (right on tablets, below on phones) */}
        <View style={styles.details}>
          <View style={styles.titleRow}>
            <Text variant="titleLarge" style={styles.title} numberOfLines={2}>
              {petName}
            </Text>
            <Chip
              compact
              icon="paw"
              style={{ backgroundColor: theme.colors.primaryContainer }}
              textStyle={{ color: theme.colors.onPrimaryContainer }}
            >
              {petType}
            </Chip>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Icon source="calendar-clock-outline" size={16} color={theme.colors.onSurfaceVariant} />
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Last seen {lastSeen}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Icon source="map-marker-outline" size={16} color={theme.colors.onSurfaceVariant} />
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {distanceMiles.toFixed(1)} mi away
              </Text>
            </View>
          </View>

          <View style={styles.grid}>
            <Detail label="Breed" width={detailWidth}>
              <Text variant="bodyMedium">{breed}</Text>
            </Detail>
            <Detail label="Species" width={detailWidth}>
              <Text variant="bodyMedium">{species}</Text>
            </Detail>
            <Detail label="Gender" width={detailWidth}>
              <Icon source={g.icon} size={16} color={theme.colors.onSurface} />
              <Text variant="bodyMedium"> {g.label}</Text>
            </Detail>
            <Detail label="Age" width={detailWidth}>
              <Text variant="bodyMedium">{age}</Text>
            </Detail>
          </View>

          <View style={styles.section}>
            <Text
              variant="labelSmall"
              style={{ color: theme.colors.onSurfaceVariant, textTransform: "uppercase" }}
            >
              Colors
            </Text>
            {colors.length > 0 ? (
              <View style={styles.chips}>
                {colors.map((c) => (
                  <Chip key={c} compact mode="outlined">
                    {c}
                  </Chip>
                ))}
              </View>
            ) : (
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Not specified
              </Text>
            )}
          </View>

          {!!features && (
            <View style={styles.section}>
              <Text
                variant="labelSmall"
                style={{ color: theme.colors.onSurfaceVariant, textTransform: "uppercase" }}
              >
                Features
              </Text>
              <Text variant="bodyMedium">{features}</Text>
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
  photoPlaceholder: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  photoNarrow: {
    width: "100%",
    aspectRatio: 4 / 3,
  },
  photoWide: {
    width: 240,
    aspectRatio: 1,
    alignSelf: "flex-start",
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