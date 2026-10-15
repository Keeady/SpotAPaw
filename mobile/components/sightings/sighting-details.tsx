import * as React from "react";
import {
  Linking,
  ScrollView,
  TouchableOpacity,
  View,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import {
  Card,
  Avatar,
  Text,
  Button,
  Chip,
  Portal,
  Icon,
  SegmentedButtons,
  useTheme,
} from "react-native-paper";
import { useState } from "react";
import ReportLostPetFab from "./report-fab";
import {
  getLastSeenLocationDistance,
  getLastSeenLocationURLMap,
  getLastSeenTimeDistance,
} from "./util";
import { getIconByAnimalSpecies } from "../util";
import { usePermission } from "../Provider/permission-provider";
import SightingGallery from "./gallery";
import { AggregatedSighting } from "@/db/models/sighting";
import { useTranslation } from "react-i18next";
import { useLocaleContext } from "../Provider/locale-provider";
import { InstrumentCallbacks } from "@/instrumentation/telemetry";
import DropPinOnMap from "../map-util";

const TABLET_BREAKPOINT = 600; // dp: phones below, tablets/iPads at or above

function dedupPhotos(sightings: AggregatedSighting[]) {
  const seen = new Set();
  const photos: string[] = [];

  sightings.forEach((s) => {
    if (s.photos && s.photos.length > 0) {
      s.photos.forEach((url) => {
        if (url && !seen.has(url)) {
          seen.add(url);
          photos.push(url);
        }
      });
    }
  });

  return photos;
}

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
  if (gender === "male") return "gender-male";
  if (gender === "female") return "gender-female";
  return "help-circle-outline";
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
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

function ColorChips({ colors }: { colors: string[] }) {
  return (
    <View style={styles.chips}>
      {colors.map((c) => (
        <Chip key={c} compact mode="outlined">
          {c}
        </Chip>
      ))}
    </View>
  );
}

export default function SightingDetail({
  sightings,
  petSummary,
  onAddSighting,
  onEdit,
  claimPet,
  claimed,
  hasOwner,
  isOwner,
  onPetFound,
  petName,
  onShareSighting,
  onFindMatches,
  instrument,
}: {
  sightings: AggregatedSighting[];
  petSummary: AggregatedSighting;
  claimed: boolean;
  onEdit?: () => void;
  onAddSighting: () => void;
  claimPet?: () => void;
  hasOwner: boolean;
  isOwner: boolean;
  onPetFound?: () => void;
  petName: string;
  onShareSighting: () => void;
  onFindMatches: () => void;
  instrument?: InstrumentCallbacks;
}) {
  const { t } = useTranslation(["sightingdetails", "translation"]);
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const [isVisible, setIsVisible] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const uniquePhotos = dedupPhotos(sightings);
  const images = uniquePhotos?.map((url) => ({ uri: url })) || [];
  const { location: userCurrentLocation } = usePermission();
  const { preferredLanguage } = useLocaleContext();

  // One pin per sighting that has coordinates; the latest sighting is highlighted
  const pins = React.useMemo(
    () =>
      sightings
        .map((s, index) => ({
          latitude: Number(s.lastSeenLat),
          longitude: Number(s.lastSeenLong),
          title: getLastSeenTimeDistance(s.lastSeenTime, preferredLanguage),
          color: index === 0 ? theme.colors.primary : theme.colors.outline,
          description: s.features || s.note || "",
        }))
        .filter(
          (p) => Number.isFinite(p.latitude) && Number.isFinite(p.longitude),
        ),
    [sightings, preferredLanguage, theme],
  );

  const isWide = width >= TABLET_BREAKPOINT;
  // 2 columns on phones, 4 on tablets/iPads
  const detailWidth: `${number}%` = isWide ? "25%" : "50%";

  const handleCall = (phone: string) => {
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  const handleText = (phone: string) => {
    if (phone) Linking.openURL(`sms:${phone}`);
  };

  React.useEffect(() => {
    instrument?.success({
      status: "success",
    });
  }, [instrument]);

  const summaryColors = toColorList(petSummary?.colors);
  const speciesKey = petSummary?.species ? capitalize(petSummary.species) : "";
  const speciesLabel = speciesKey
    ? t(`animal.${speciesKey}`, { ns: "translation" })
    : "";

  return (
    <Portal.Host>
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.page}>
            {/* ---------- Summary card ---------- */}
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
                  {images.length > 0 ? (
                    <SightingGallery
                      images={images}
                      isVisible={isVisible}
                      setIsVisible={setIsVisible}
                      mainPhoto={
                        petSummary?.photos && petSummary.photos.length > 0
                          ? petSummary.photos[0]
                          : undefined
                      }
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
                  <View style={styles.titleRow}>
                    <Text
                      variant="titleLarge"
                      style={styles.title}
                      numberOfLines={2}
                    >
                      {petSummary?.name || petName || t("unknown")}
                    </Text>
                    {!!speciesKey && (
                      <Chip
                        compact
                        icon={getIconByAnimalSpecies(petSummary.species)}
                        style={{ backgroundColor: theme.colors.primaryContainer }}
                        textStyle={{ color: theme.colors.onPrimaryContainer }}
                      >
                        {speciesLabel}
                      </Chip>
                    )}
                  </View>

                  <View style={styles.grid}>
                    {!!petSummary?.breed && (
                      <Detail label={t("breed")} width={detailWidth}>
                        <Text variant="bodyMedium">{petSummary.breed}</Text>
                      </Detail>
                    )}
                    {!!petSummary?.gender && (
                      <Detail label={t("gender")} width={detailWidth}>
                        <Icon
                          source={genderIcon(petSummary.gender)}
                          size={16}
                          color={theme.colors.onSurface}
                        />
                        <Text variant="bodyMedium">
                          {" "}
                          {t(`gender.${petSummary.gender}`, {
                            ns: "translation",
                          })}
                        </Text>
                      </Detail>
                    )}
                    {!!petSummary?.age && (
                      <Detail
                        label={t("ageLabel", { ns: "translation" })}
                        width={detailWidth}
                      >
                        <Text variant="bodyMedium">
                          {t("ageWithCount", {
                            count: petSummary.age,
                            ns: "translation",
                          })}
                        </Text>
                      </Detail>
                    )}
                  </View>

                  {summaryColors.length > 0 && (
                    <View style={styles.section}>
                      <Label>{t("colors")}</Label>
                      <ColorChips colors={summaryColors} />
                    </View>
                  )}

                  {!!petSummary?.features && (
                    <View style={styles.section}>
                      <Label>{t("features")}</Label>
                      <Text variant="bodyMedium">{petSummary.features}</Text>
                    </View>
                  )}

                  {!!petSummary?.note && (
                    <View style={styles.section}>
                      <Label>{t("notes")}</Label>
                      <Text variant="bodyMedium">{petSummary.note}</Text>
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
                {claimed && (
                  <Chip mode="outlined" disabled={claimed}>
                    {t("ownerPending")}
                  </Chip>
                )}
                {!hasOwner && claimPet && (
                  <Button mode="contained" onPress={() => claimPet()}>
                    {t("thisIsMyPet")}
                  </Button>
                )}
                <Button mode="outlined" onPress={() => onFindMatches()}>
                  {t("viewMatches")}
                </Button>
                <Button mode="outlined" onPress={() => onFindMatches()}>
                  {t("viewPoster")}
                </Button>
                {onPetFound && (
                  <Button mode="text" onPress={() => onPetFound()}>
                    {t("petFound")}
                  </Button>
                )}
                {onEdit && (
                  <Button mode="text" onPress={() => onEdit()}>
                    {t("editSighting")}
                  </Button>
                )}
              </View>
            </Card>

            {/* ---------- Sightings timeline ---------- */}
            {sightings.length > 0 && (
              <View style={styles.sectionRow}>
                <Text variant="titleLarge" style={styles.sectionTitle}>
                  {t("sightingTimeline")}
                </Text>
                <SegmentedButtons
                  value={viewMode}
                  onValueChange={(v) => setViewMode(v as "list" | "map")}
                  density="small"
                  buttons={[
                    {
                      value: "list",
                      label: t("listView", "List"),
                      icon: "format-list-bulleted",
                    },
                    {
                      value: "map",
                      label: t("mapView", "Map"),
                      icon: "map-outline",
                    },
                  ]}
                />
              </View>
            )}

            {viewMode === "map" ? (
              pins.length > 0 ? (
                <View
                  style={[
                    styles.mapWrap,
                    isWide && styles.mapWrapWide,
                    { borderColor: theme.colors.outlineVariant },
                  ]}
                >
                  <DropPinOnMap
                    currentLocation={{lat: pins[0].latitude, lng: pins[0].longitude}}
                    handleActionButton={() => void 0}
                    pins={pins}
                    readonly={true}
                  />
                </View>
              ) : (
                <Text
                  variant="bodyMedium"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  {t("noMapLocations", "No locations to show on the map.")}
                </Text>
              )
            ) : (
            sightings.map((sighting, index) => {
              const reportName = sighting.reporterName;
              const reporterPhone = sighting.reporterPhone;
              const isLatest = index === 0; // assuming sightings sorted DESC by created_at
              const colors = toColorList(sighting.colors);
              const hasMapLocation = !!(
                sighting.lastSeenLocation ||
                (sighting.lastSeenLat && sighting.lastSeenLong)
              );

              return (
                <View key={sighting.id} style={styles.timelineRow}>
                  {/* Timeline rail */}
                  <View style={styles.rail}>
                    <View
                      style={[
                        styles.dot,
                        {
                          backgroundColor: isLatest
                            ? theme.colors.primary
                            : theme.colors.outlineVariant,
                        },
                      ]}
                    />
                    {index < sightings.length - 1 && (
                      <View
                        style={[
                          styles.railLine,
                          { backgroundColor: theme.colors.outlineVariant },
                        ]}
                      />
                    )}
                  </View>

                  {/* Sighting card */}
                  <View style={styles.timelineCardWrap}>
                    <Card
                      mode="outlined"
                      style={[
                        styles.sightingCard,
                        { backgroundColor: theme.colors.surface },
                        isLatest && {
                          borderColor: theme.colors.primary,
                          borderWidth: 1.5,
                        },
                      ]}
                    >
                      <View style={styles.sightingContent}>
                        {/* Header: thumbnail + time + distance */}
                        <View style={styles.sightingHeader}>
                          {sighting.photos && sighting.photos.length > 0 ? (
                            <TouchableOpacity
                              onPress={() => setIsVisible(true)}
                              accessibilityRole="imagebutton"
                            >
                              <Avatar.Image
                                size={48}
                                source={{ uri: sighting.photos[0] }}
                              />
                            </TouchableOpacity>
                          ) : (
                            <Avatar.Icon size={48} icon="paw" />
                          )}
                          <View style={styles.sightingHeaderText}>
                            <Text variant="titleSmall" style={styles.bold}>
                              {getLastSeenTimeDistance(
                                sighting.lastSeenTime,
                                preferredLanguage,
                              )}
                            </Text>
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
                                {userCurrentLocation &&
                                sighting.lastSeenLat &&
                                sighting.lastSeenLong
                                  ? getLastSeenLocationDistance(
                                      userCurrentLocation,
                                      sighting.lastSeenLat,
                                      sighting.lastSeenLong,
                                      t,
                                    )
                                  : t("noDistanceData")}
                              </Text>
                            </View>
                          </View>
                        </View>

                        {/* Breed / gender */}
                        {(!!sighting.breed || !!sighting.gender) && (
                          <View style={styles.grid}>
                            {!!sighting.breed && (
                              <Detail label={t("breed")} width="50%">
                                <Text variant="bodyMedium">{sighting.breed}</Text>
                              </Detail>
                            )}
                            {!!sighting.gender && (
                              <Detail label={t("gender")} width="50%">
                                <Icon
                                  source={genderIcon(sighting.gender)}
                                  size={16}
                                  color={theme.colors.onSurface}
                                />
                                <Text variant="bodyMedium">
                                  {" "}
                                  {t(`gender.${sighting.gender}`, {
                                    ns: "translation",
                                  })}
                                </Text>
                              </Detail>
                            )}
                          </View>
                        )}

                        {colors.length > 0 && (
                          <View style={styles.section}>
                            <Label>{t("colors")}</Label>
                            <ColorChips colors={colors} />
                          </View>
                        )}

                        {!!sighting.features && (
                          <Text variant="bodyMedium">
                            {t("featuresFeatures", {
                              features: sighting.features,
                            })}
                          </Text>
                        )}
                        {!!sighting.note && (
                          <Text variant="bodyMedium">
                            {t("notesNote", { note: sighting.note })}
                          </Text>
                        )}

                        {/* Footer: reporter contact + Google Maps link */}
                        <View
                          style={[
                            styles.sightingFooter,
                            { borderTopColor: theme.colors.outlineVariant },
                          ]}
                        >
                          <Button
                            mode="contained-tonal"
                            icon="google-maps"
                            compact
                            disabled={!hasMapLocation}
                            onPress={() =>
                              Linking.openURL(
                                getLastSeenLocationURLMap(
                                  sighting.lastSeenLocation,
                                  sighting.lastSeenLat,
                                  sighting.lastSeenLong,
                                ),
                              )
                            }
                          >
                            {t("viewOnMap", "Open in Google Maps")}
                          </Button>

                          {isOwner && reporterPhone && (
                            <View style={styles.reporter}>
                              <Text variant="labelLarge">
                                {t("reportedBy")} {reportName}
                              </Text>
                              <Button
                                mode="text"
                                icon="phone"
                                compact
                                onPress={() => handleCall(reporterPhone)}
                              >
                                {t("call")}
                              </Button>
                              <Button
                                mode="text"
                                icon="message-text"
                                compact
                                onPress={() => handleText(reporterPhone)}
                              >
                                {t("text")}
                              </Button>
                            </View>
                          )}
                        </View>
                      </View>
                    </Card>
                  </View>
                </View>
              );
            })
            )}
          </View>
        </ScrollView>

        <ReportLostPetFab
          onFormPress={onAddSighting}
          handleShare={onShareSighting}
          title={t("iveSeenThisPet")}
          showGroup={true}
        />
      </View>
    </Portal.Host>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 120, // room for the floating action button
  },
  page: {
    width: "100%",
    maxWidth: 900, // keeps content readable on large iPads
    alignSelf: "center",
  },

  // Summary card
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

  // CTA row
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

  // Timeline
  sectionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: "700",
  },
  mapWrap: {
    height: 420,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
  },
  mapWrapWide: {
    height: 520,
  },
  timelineRow: {
    flexDirection: "row",
  },
  rail: {
    alignItems: "center",
    width: 20,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginVertical: 4,
  },
  railLine: {
    flex: 1,
    width: 2,
    marginTop: 2,
  },
  timelineCardWrap: {
    flex: 1,
    marginBottom: 16,
    marginLeft: 6,
  },
  sightingCard: {
    borderRadius: 16,
  },
  sightingContent: {
    padding: 16,
    gap: 12,
  },
  sightingHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sightingHeaderText: {
    flex: 1,
    gap: 2,
  },
  bold: {
    fontWeight: "700",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  sightingFooter: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 12,
    gap: 8,
    alignItems: "flex-start",
  },
  reporter: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    columnGap: 4,
  },
});