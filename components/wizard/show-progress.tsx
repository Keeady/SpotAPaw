import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { ScrollView, StyleSheet, View, Image } from "react-native";
import {
  Button,
  Chip,
  Icon,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import { WizardHeader } from "./wizard-header";
import { useRouter } from "expo-router";
import { AuthContext } from "../Provider/auth-provider";
import { buildFilterTags, FilterTag } from "./progress-util";
import { SightingRepository } from "@/db/repositories/sighting-repository";
import { SIGHTING_RADIUSKM } from "../constants";
import { showMessage } from "react-native-flash-message";
import {
  createErrorLogMessage,
  getIconByAnimalSpecies,
  getLastSeenLocation,
  isValidUuid,
  kmToMiles,
} from "../util";
import { log } from "../logs";
import { useTranslation } from "react-i18next";
import { AggregatedSighting } from "@/db/models/sighting";
import { AiDescriptionRepository } from "@/db/repositories/ai-description-repository";

type ShowProgressProps = {
  sightingId: string;
};

export default function ShowProgress({ sightingId }: ShowProgressProps) {
  const { t } = useTranslation(["wizard", "translation"]);
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [filterTags, setFilterTags] = useState<FilterTag[]>([]);
  const [sightingFormData, setSightingFormData] =
    useState<AggregatedSighting | null>(null);
  const [petDescription, setPetDescription] = useState<{
    id: string;
    narrative: string;
    best_photo_url: string;
  } | null>(null);
  const { user } = useContext(AuthContext);
  const router = useRouter();

  const isMountedRef = useRef(true);
  const sightingsRoute = user ? "my-sightings" : "sightings";

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const fetchSightingData = async () => {
      if (!sightingId || !isValidUuid(sightingId)) {
        return;
      }
      setLoading(true);
      const sightingRepository = new SightingRepository();
      sightingRepository
        .getSighting(sightingId)
        .then((data) => {
          if (!isMountedRef.current) {
            return;
          }
          setSightingFormData(data);
        })
        .catch((error) => {
          const errorMessage = createErrorLogMessage(error);
          log(`Failed to fetch sighting data: ${errorMessage}`);
        })
        .finally(() => {
          if (!isMountedRef.current) {
            return;
          }
          setLoading(false);
        });
    };

    fetchSightingData();
  }, [sightingId]);

  useEffect(() => {
    const fetchFilterTags = async () => {
      const radiusMiles = kmToMiles(SIGHTING_RADIUSKM)
        ? t("valMiles", "{{val}} miles", { val: kmToMiles(SIGHTING_RADIUSKM) })
        : "";

      if (!sightingFormData) {
        return setFilterTags(buildFilterTags("", "", radiusMiles, t));
      }

      const lastSeenLocation = await getLastSeenLocation(
        sightingFormData.lastSeenLocation,
        sightingFormData.lastSeenLat,
        sightingFormData.lastSeenLong,
        false,
      );

      const lastSeenTime = sightingFormData?.lastSeenTime
        ? new Date(sightingFormData.lastSeenTime).toLocaleDateString()
        : "";

      const tags = buildFilterTags(
        lastSeenLocation,
        lastSeenTime,
        radiusMiles,
        t,
      );
      setFilterTags(tags);
    };
    fetchFilterTags();
  }, [sightingFormData]);

  useEffect(() => {
    const fetchPetDescription = async () => {
      if (sightingFormData?.petDescriptionId) {
        const repository = new AiDescriptionRepository();
        repository
          .getAiDescription(sightingFormData.petDescriptionId)
          .then((data) => {
            if (!isMountedRef.current) {
              return;
            }

            if (data) {
              setPetDescription(data);
            }
          })
          .catch((error) => {
            const errorMessage = createErrorLogMessage(error);
            log(`Failed to fetch pet description: ${errorMessage}`);
          });
      }
    };

    fetchPetDescription();
  }, [sightingFormData?.petDescriptionId]);

  const onViewMatches = useCallback(() => {
    if (!sightingId || !sightingFormData?.petDescriptionId) {
      showMessage({
        message: t(
          "petMatchingIsStillProcessingPleaseTryAgainInAMoment",
          "Pet matching is still processing. Please try again in a moment.",
        ),
        type: "warning",
        icon: "warning",
        statusBarHeight: 50,
      });
      return;
    }

    router.push(
      `/${sightingsRoute}/match/?sightingId=${sightingId}&petDescriptionId=${sightingFormData?.petDescriptionId}`,
    );
  }, [sightingId, sightingFormData?.petDescriptionId, router, sightingsRoute]);

  const onGeneratePoster = useCallback(() => {
    if (!sightingId) {
      return;
    }

    router.push(`/posters/?sightingId=${sightingId}`);
  }, [sightingId, router]);

  return (
    <View style={{ flex: 1 }}>
      <WizardHeader
        title={t("sightingSubmitted", "Sighting Submitted!")}
        subTitle={t(
          "hangTightProcessingReport",
          "Hang tight — we are processing your report.",
        )}
      />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Surface style={styles.card} elevation={1}>
          <Text style={styles.cardTitle}>
            {t("matchingFilters", "Matching Filters")}
          </Text>
          <Text style={styles.cardSubtitle}>
            {t(
              "weAreSearchingForSimilarPetsUsingTheseParameters",
              "We are searching for similar pets using these parameters",
            )}
          </Text>
          <View style={styles.chipGrid}>
            {filterTags.map((tag, idx) => (
              <Chip
                key={idx}
                icon={tag.icon}
                style={styles.filterChip}
                textStyle={styles.filterChipText}
                ellipsizeMode="tail"
              >
                {tag.label}: {tag.value}
              </Chip>
            ))}
            <View
              style={[
                styles.filterChip,
                styles.aiDescriptionWrapper,
                {
                  backgroundColor: theme.colors.secondaryContainer,
                  borderRadius: 20,
                },
              ]}
            >
              <Icon
                source={getIconByAnimalSpecies(sightingFormData?.species || "")}
                size={18}
                color={theme.colors.primary}
              />
              <Text
                variant="labelLarge"
                style={[
                  styles.filterChipText,
                  styles.aiDescriptionText,
                  { color: theme.colors.onSecondaryContainer },
                ]}
              >
                {t("aiDescription", "AI Description", { ns: "translation" })}:
              </Text>
              <Text
                style={[
                  styles.filterChipText,
                  styles.aiDescriptionText,
                  { color: theme.colors.onSecondaryContainer },
                ]}
                variant="labelSmall"
              >
                {petDescription?.narrative ||
                  t("noDescriptionAvailable", "No description available.", {
                    ns: "translation",
                  })}
              </Text>
            </View>
          </View>
        </Surface>
        <Surface style={styles.card} elevation={1}>
          <View style={styles.animationWrapper}>
            {petDescription?.best_photo_url ? (
              <Image
                source={{ uri: petDescription.best_photo_url }}
                resizeMode={"contain"}
                style={{
                  width: 350,
                  height: "auto",
                  borderRadius: 12,
                  aspectRatio: 1,
                }}
                testID="best-photo"
              />
            ) : sightingFormData?.photos &&
              sightingFormData.photos.length > 0 ? (
              <Image
                source={{ uri: sightingFormData.photos[0] }}
                resizeMode={"contain"}
                style={{
                  width: 350,
                  height: "auto",
                  borderRadius: 12,
                  aspectRatio: 1,
                }}
                testID="sighting-photo"
              />
            ) : (
              <View
                style={{
                  width: 200,
                  height: 200,
                  borderRadius: 12,
                  backgroundColor: "#eee",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text>{t("noPhoto", "No photo", { ns: "translation" })}</Text>
              </View>
            )}
          </View>
        </Surface>
        <View style={styles.ctaWrapper}>
          <Button
            mode="outlined"
            icon={loading ? "lock-outline" : "paw"}
            disabled={loading}
            onPress={onViewMatches}
            contentStyle={styles.btnContent}
          >
            {t("viewMatches", "View Matches")}
          </Button>
        </View>
        <View style={styles.ctaWrapper}>
          <Button
            mode="outlined"
            icon={loading ? "lock-outline" : "paw"}
            disabled={loading}
            onPress={onGeneratePoster}
            contentStyle={styles.btnContent}
          >
            {t("generatePoster", "Generate Poster", { ns: "translation" })}
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    padding: 20,
    paddingBottom: 48,
    gap: 16,
  },

  // Card
  card: {
    borderRadius: 20,
    padding: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#EAD9C8",
    gap: 4,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#9E8E7E",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#7A6658",
    marginTop: -8,
    marginBottom: 14,
  },

  // Filter chips
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterChip: {
    borderRadius: 20,
    maxWidth: "100%",
    flexWrap: "wrap",
  },
  filterChipText: {
    fontSize: 12,
    color: "#2D1F0F",
    flexWrap: "wrap",
  },

  // CTA
  ctaWrapper: {
    marginTop: 8,
    width: "100%",
  },
  btnContent: {
    width: "100%",
    flexDirection: "row-reverse",
  },
  animationWrapper: {
    alignContent: "center",
    alignItems: "center",
  },
  aiDescriptionWrapper: {
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    alignContent: "center",
    gap: 6,
  },
  aiDescriptionText: {
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.1,
    lineHeight: 20,
  },
});
