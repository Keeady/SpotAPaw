import { useContext, useEffect, useRef, useState } from "react";
import { SightingWizardStepData } from "./wizard-interface";
import { View } from "react-native";
import { Text } from "react-native-paper";
import { AggregatedSighting } from "@/db/models/sighting";
import { SightingSelection } from "../sightings/sighting-selection";
import { SightingRepository } from "@/db/repositories/sighting-repository";
import { WizardHeader } from "./wizard-header";
import { useRouter } from "expo-router";
import { AuthContext } from "../Provider/auth-provider";
import { createErrorLogMessage } from "../util";
import { log } from "../logs";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { useTranslation } from "react-i18next";

export function FindMatch({ sightingFormData }: SightingWizardStepData) {
  const { t } = useTranslation("wizard");
  const [loading, setLoading] = useState(false);
  const [matchResults, setMatchResults] = useState<AggregatedSighting[]>([]);
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
    if (sightingFormData?.sightingId && sightingFormData?.petDescriptionId) {
      setLoading(true);
      const repository = new SightingRepository();
      repository
        .getMatchingSightings(
          sightingFormData.sightingId,
          sightingFormData.petDescriptionId,
        )
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
  }, [sightingFormData?.sightingId, sightingFormData?.petDescriptionId]);

  const onSightingSelect = (id: string) => {
    if (!id) {
      return;
    }

    const index = matchResults.findIndex((s) => s.id === id);

    if (index === -1) {
      return;
    }

    const sighting = matchResults[index];
    if (sighting.linkedSightingId && sighting.petId) {
      router.push(
        `/${sightingRoute}/${id}?linkedSightingId=${sighting.linkedSightingId}&petId=${sighting.petId}`,
      );
      return;
    }

    if (sighting.linkedSightingId) {
      router.push(
        `/${sightingRoute}/${id}?linkedSightingId=${sighting.linkedSightingId}`,
      );
      return;
    }

    router.push(`/${sightingRoute}/${id}`);
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

      {!loading && matchResults.length > 0 && (
        <SightingSelection
          setSelectedSightingId={onSightingSelect}
          selectedSightingId={sightingFormData.sightingId}
          sightings={matchResults}
        />
      )}
    </View>
  );
}
