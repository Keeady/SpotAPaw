import { SightingWizardStepData } from "./wizard-interface";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Chip, Surface, Text } from "react-native-paper";
import { WizardHeader } from "./wizard-header";
import { useRouter } from "expo-router";
import { AuthContext } from "../Provider/auth-provider";
import { buildFilterTags, FilterTag } from "./progress-util";
import { ShowHappyDogAnimation } from "@/components/animate";
import { SightingRepository } from "@/db/repositories/sighting-repository";
import { SIGHTING_RADIUSKM } from "../constants";
import { showMessage } from "react-native-flash-message";
import { createErrorLogMessage, getLastSeenLocation, kmToMiles } from "../util";
import { log } from "../logs";

export default function ShowProgress({
  sightingFormData,
}: SightingWizardStepData) {
  const [loading, setLoading] = useState(true);
  const [filterTags, setFilterTags] = useState<FilterTag[]>([]);

  useEffect(() => {
    const fetchFilterTags = async () => {
      const species = sightingFormData.species
        ? sightingFormData.species.charAt(0).toUpperCase() +
          sightingFormData.species.slice(1)
        : "Unknown species";
      const lastSeenLocation = await getLastSeenLocation(
        sightingFormData.lastSeenLocation,
        sightingFormData.lastSeenLat,
        sightingFormData.lastSeenLong,
        false,
      );

      const lastSeenTime = sightingFormData?.lastSeenTime
        ? new Date(sightingFormData.lastSeenTime).toLocaleDateString()
        : "";
      const radiusMiles = kmToMiles(SIGHTING_RADIUSKM)
        ? `${kmToMiles(SIGHTING_RADIUSKM)} miles`
        : "";

      const tags = buildFilterTags(
        lastSeenLocation,
        lastSeenTime,
        radiusMiles,
        species,
      );
      setFilterTags(tags);
    };
    fetchFilterTags();
  }, [sightingFormData]);

  const { user } = useContext(AuthContext);
  const router = useRouter();
  const { sightingId, petDescriptionId } = sightingFormData;
  const sightingsRoute = user ? "my-sightings" : "sightings";
  const onViewMatches = useCallback(() => {
    if (!sightingId || !petDescriptionId) {
      showMessage({
        message:
          "Pet matching is still processing. Please try again in a moment.",
        type: "warning",
        icon: "warning",
        statusBarHeight: 50,
      });
      return;
    }

    router.push(
      `/${sightingsRoute}/match/?sightingId=${sightingId}&petDescriptionId=${petDescriptionId}`,
    );
  }, [sightingId, petDescriptionId, router, sightingsRoute]);

  const onFindMatches = useCallback(() => {
    if (!sightingId) {
      return;
    }
    setLoading(true);

    const repository = new SightingRepository();

    const userLocationLat = sightingFormData.lastSeenLat;
    const userLocationLong = sightingFormData.lastSeenLong;
    const sightingRadiusKm = SIGHTING_RADIUSKM;

    repository
      .findMatchingSightings(
        sightingId,
        userLocationLat,
        userLocationLong,
        sightingRadiusKm,
      )
      .catch((error) => {
        const errorMessage = createErrorLogMessage(error);
        log(`Error processing matching sightings: ${errorMessage}`);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [sightingFormData.lastSeenLat, sightingFormData.lastSeenLong, sightingId]);

  useEffect(() => {
    onFindMatches();
  }, [onFindMatches]);

  return (
    <View style={{ flex: 1 }}>
      <WizardHeader
        title="Sighting Submitted!"
        subTitle="Hang tight — we are processing your report."
      />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Surface style={styles.card} elevation={1}>
          <Text style={styles.cardTitle}>Matching Filters</Text>
          <Text style={styles.cardSubtitle}>
            We are searching for similar pets using these parameters
          </Text>
          <View style={styles.chipGrid}>
            {filterTags.map((tag, idx) => (
              <Chip
                key={idx}
                icon={tag.icon}
                style={styles.filterChip}
                textStyle={styles.filterChipText}
              >
                {tag.label}: {tag.value}
              </Chip>
            ))}
          </View>
        </Surface>

        <View style={styles.animationWrapper}>
          <ShowHappyDogAnimation />
        </View>

        <View style={styles.ctaWrapper}>
          <Button
            mode="contained"
            icon={loading ? "lock-outline" : "paw"}
            disabled={loading}
            onPress={onViewMatches}
            contentStyle={styles.btnContent}
          >
            View Matches
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
    padding: 20,
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
    backgroundColor: "#FAE5D3",
    borderRadius: 20,
  },
  filterChipText: {
    fontSize: 12,
    color: "#2D1F0F",
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
});
