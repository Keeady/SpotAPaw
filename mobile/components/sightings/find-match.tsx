import { useContext, useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { Text } from "react-native-paper";
import { SightingRepository } from "@/db/repositories/sighting-repository";
import { useRouter } from "expo-router";
import { AuthContext } from "../Provider/auth-provider";
import { createErrorLogMessage } from "../util";
import { log } from "../logs";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { useTranslation } from "react-i18next";
import { WizardHeader } from "../wizard/wizard-header";
import { Match } from "@/db/repositories/base-sighting-repository";
import { MatchCard } from "./match-card";

export function ShowMatches({ sightingId }: { sightingId: string }) {
  const { t } = useTranslation("wizard");
  const [loading, setLoading] = useState(false);
  const [matchResults, setMatchResults] = useState<Match[]>([]);
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const sightingRoute = user ? "my-sightings" : "sightings";

  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (sightingId) {
      setLoading(true);
      const repository = new SightingRepository();
      repository
        .getMatchingSightings(sightingId)
        .then((results) => {
          if (!isMountedRef.current) {
            return;
          }

          if (results.length > 0) {
            setMatchResults(results);
          }
        })
        .catch(async (error) => {
          if (!isMountedRef.current) {
            return;
          }

          if (error instanceof FunctionsHttpError) {
            const errorContext = await error.context.json().catch(() => null);
            log(`Failed to fetch matching sightings: ${errorContext?.message}`);
          } else {
            const errorMessage = createErrorLogMessage(error);
            log(`Failed to fetch matching sightings: ${errorMessage}`);
          }
        })
        .finally(() => {
          if (!isMountedRef.current) {
            return;
          }
          setLoading(false);
        });
    }
  }, [sightingId]);

  const onSightingSelect = (id: string) => {
    if (!id) {
      return;
    }

    const index = matchResults.findIndex((m) => m.id === id);

    if (index === -1) {
      return;
    }

    const sighting = matchResults[index].sighting;
    if (sighting?.linkedSightingId && sighting.petId) {
      router.push(
        `/${sightingRoute}/${sighting.id}?linkedSightingId=${sighting.linkedSightingId}&petId=${sighting.petId}`,
      );
      return;
    }

    if (sighting?.linkedSightingId) {
      router.push(
        `/${sightingRoute}/${sighting.id}?linkedSightingId=${sighting.linkedSightingId}`,
      );
      return;
    }

    router.push(`/${sightingRoute}/${sighting?.id}`);
  };

  const title =
    loading || matchResults.length === 0
      ? t("lookingForPossibleMatches", "Looking For Possible Matches")
      : t("possibleMatchesFound", "Possible Matches Found");
  const subTitle =
    loading || matchResults.length === 0
      ? t(
          "lookingForPetsMatchingYourPetsDescription",
          "Looking for pets matching your pet's description.",
        )
      : t(
          "thesePetsCloselyMatchTheDescription",
          "These pets closely match the description.",
        );

  const bodyText = loading ? (
    <Text variant="bodyMedium">
      {t("lookingForPossibleMatches2", "Looking for possible matches...")}
    </Text>
  ) : matchResults.length === 0 ? (
    <>
      <Text variant="bodyLarge">
        {t("noMatchesFoundYet", "No Matches Found Yet")}
      </Text>
      <Text variant="bodyMedium">
        {t(
          "weWillKeepLookingComeBackSoonAsNewSightingsAreReportedEveryDay",
          "We will keep looking. Come back soon as new sightings are reported every day.",
        )}
      </Text>
    </>
  ) : null;

  return (
    <View style={{ flex: 1 }}>
      <WizardHeader title={title} subTitle={subTitle} />

      {bodyText && (
        <View
          style={{
            padding: 16,
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {bodyText}
        </View>
      )}

      {!loading &&
        matchResults.length > 0 &&
        matchResults.map((m) => (
          <MatchCard match={m} onSelect={() => onSightingSelect(m.id)} />
        ))}
    </View>
  );
}
