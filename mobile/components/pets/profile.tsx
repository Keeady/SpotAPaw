import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { Card, Text, Chip, Button, Icon, useTheme } from "react-native-paper";
import { useTranslation } from "react-i18next";
import SightingGallery from "../sightings/gallery";

type PetProfile = {
  id: string;
  name: string;
  breed?: string;
  gender?: string;
  age?: number;
  colors?: string;
  photo?: string;
  status?: "lost" | "found" | "safe";
  features?: string;
  species?: string;
  note?: string;
  photos?: string[];
};

type PetProfileCardProps = {
  petProfile: PetProfile;
  onDeletePet: () => void;
  onEditPet: () => void;
  onPetLost: () => void;
  onPetFound: () => void;
  viewPetSightings: () => void;
};

const TABLET_BREAKPOINT = 600; // dp: phones below, tablets/iPads at or above

const STATUS_STYLES = {
  lost: { bg: "#FFEBEE", text: "#C62828", icon: "alert-circle-outline" }, // red
  found: { bg: "#FFF3E0", text: "#EF6C00", icon: "check-circle-outline" }, // orange
  safe: { bg: "#E8F5E9", text: "#2E7D32", icon: "shield-check-outline" }, // green
} as const;
const STATUS_DEFAULT = { bg: "#ECEFF1", text: "#37474F", icon: "paw" }; // grey

// colors may be a comma-separated string or an array
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
  return "help-circle-outline";
}

function Label({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <Text
      variant="labelSmall"
      style={{
        color: theme.colors.onSurfaceVariant,
        textTransform: "uppercase",
      }}
    >
      {children}
    </Text>
  );
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
  return (
    <View style={[styles.detail, { width }]}>
      <Label>{label}</Label>
      <View style={styles.detailValue}>{children}</View>
    </View>
  );
}

const PetProfileCard: React.FC<PetProfileCardProps> = ({
  petProfile,
  onEditPet,
  onPetFound,
  onPetLost,
  onDeletePet,
  viewPetSightings,
}) => {
  const { t } = useTranslation(["petprofile", "translation"]);
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const [isVisibleGallery, setIsVisibleGallery] = React.useState(false);
  const {
    name,
    breed,
    gender,
    age,
    colors,
    status,
    features,
    species,
    note,
    photos,
  } = petProfile;

  const isWide = width >= TABLET_BREAKPOINT;
  // 2 columns on phones, 4 on tablets/iPads
  const detailWidth: `${number}%` = isWide ? "25%" : "50%";

  const statusStyle = status ? STATUS_STYLES[status] : STATUS_DEFAULT;
  const colorList = toColorList(colors);
  const hasPhotos = !!photos && photos.length > 0;

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
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
              {hasPhotos ? (
                <SightingGallery
                  images={photos!.map((photo) => ({ uri: photo }))}
                  isVisible={isVisibleGallery}
                  setIsVisible={setIsVisibleGallery}
                  mainPhoto={photos![0]}
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
                <Text
                  variant="titleLarge"
                  style={styles.title}
                  numberOfLines={2}
                >
                  {name || "Unknown"}
                </Text>
                {!!status && (
                  <Chip
                    compact
                    icon={statusStyle.icon}
                    style={{ backgroundColor: statusStyle.bg }}
                    textStyle={{ color: statusStyle.text, fontWeight: "bold" }}
                  >
                    {t(`status.${status}`)}
                  </Chip>
                )}
              </View>

              <View style={styles.grid}>
                {!!breed && (
                  <Detail label={t("breed", "Breed")} width={detailWidth}>
                    <Text variant="bodyMedium">{breed}</Text>
                  </Detail>
                )}
                {!!species && (
                  <Detail
                    label={t("species", "Species", { ns: "translation" })}
                    width={detailWidth}
                  >
                    <Text variant="bodyMedium">
                      {t(`animal.${species}`, species, { ns: "translation" })}
                    </Text>
                  </Detail>
                )}
                {!!gender && (
                  <Detail
                    label={t("genderLabel", { ns: "translation" })}
                    width={detailWidth}
                  >
                    <Icon
                      source={genderIcon(gender)}
                      size={16}
                      color={theme.colors.onSurface}
                    />
                    <Text variant="bodyMedium">
                      {" "}
                      {t(`gender.${gender}`, { ns: "translation" })}
                    </Text>
                  </Detail>
                )}
                {age !== undefined && (
                  <Detail
                    label={t("ageLabel", "Age", { ns: "translation" })}
                    width={detailWidth}
                  >
                    <Text variant="bodyMedium">
                      {t("ageWithCount", age.toString(), {
                        count: age,
                        ns: "translation",
                      })}
                    </Text>
                  </Detail>
                )}
              </View>

              {colorList.length > 0 && (
                <View style={styles.section}>
                  <Label>{t("colors", "Colors")}</Label>
                  <View style={styles.chips}>
                    {colorList.map((c) => (
                      <Chip key={c} compact mode="outlined">
                        {c}
                      </Chip>
                    ))}
                  </View>
                </View>
              )}

              {!!features && (
                <View style={styles.section}>
                  <Label>{t("features", "Features")}</Label>
                  <Text variant="bodyMedium">{features}</Text>
                </View>
              )}

              {!!note && (
                <View style={styles.section}>
                  <Label>{t("notes", "Notes")}</Label>
                  <Text variant="bodyMedium">{note}</Text>
                </View>
              )}
            </View>
          </View>

          {/* CTA row */}
          <View
            style={[
              styles.ctaRow,
              isWide ? styles.ctaRowWide : styles.ctaRowNarrow,
              { borderTopColor: theme.colors.outlineVariant },
            ]}
          >
            {/* Primary action depends on status */}
            {status === "lost" && (
              <Button mode="contained" icon="check" onPress={onPetFound}>
                {t("reportPetFound", "Report Pet Found")}
              </Button>
            )}
            {status === "safe" && (
              <Button mode="contained" icon="alert-outline" onPress={onPetLost}>
                {t("reportLostPet", "Report Lost Pet")}
              </Button>
            )}

            {/* Secondary actions */}
            {status === "lost" && (
              <Button
                mode="outlined"
                icon="map-marker-multiple-outline"
                onPress={viewPetSightings}
              >
                {t("viewPetSightings", "View Pet Sightings")}
              </Button>
            )}
            <Button mode="outlined" icon="pencil-outline" onPress={onEditPet}>
              {t("edit", "Edit")}
            </Button>

            {/* Destructive action */}
            <Button
              mode="text"
              icon="delete-outline"
              textColor={theme.colors.error}
              onPress={onDeletePet}
            >
              {t("delete", "Delete")}
            </Button>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  page: {
    width: "100%",
    maxWidth: 900, // keeps the card readable on large iPads
    alignSelf: "center",
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
  ctaRow: {
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 8,
  },
  ctaRowNarrow: {
    flexDirection: "column",
    alignItems: "stretch",
  },
  ctaRowWide: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    paddingHorizontal: 20,
  },
});

export default PetProfileCard;
