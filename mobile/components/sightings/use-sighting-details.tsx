import { AggregatedSighting } from "@/db/models/sighting";
import { SightingRepository } from "@/db/repositories/sighting-repository";
import { useCallback, useEffect, useState } from "react";
import { log } from "../logs";
import { createErrorLogMessage, isValidUuid } from "../util";
import { captureError } from "@/instrumentation/instrument-util";
import { InstrumentCallbacks } from "@/instrumentation/telemetry";
import { AggregatedSightingResponse } from "@/db/repositories/base-sighting-repository";

export function usePetSightings(
  sightingId: string,
  linkedSightingId: string,
  instrument?: InstrumentCallbacks,
) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [details, setDetails] = useState<AggregatedSightingResponse>();

  const fetchSightingDetails = useCallback(
    async (sightingId: string, linkedSightingId: string) => {
      setLoading(true);
      setError("");

      if (!sightingId || !isValidUuid(sightingId)) {
        log(`Sighting Details: Invalid sightingId: ${sightingId}`);
        setError("Error fetching sighting info.");
        setLoading(false);
        return;
      }

      const repository = new SightingRepository();
      repository
        .getAggregatedSightingById(sightingId, linkedSightingId)
        .then((data) => {
          if (data) {
            setDetails(data);
          }
          instrument?.success({
            source: "fetchSightingDetails"
          })
        })
        .catch((error) => {
          const errorMessage = createErrorLogMessage(error);
          const log = `Failed to fetch sighting summary for sighting: ${errorMessage}`;
          setError("Error fetching sighting info. Please try again.");
          instrument?.failure({
            error_message: log,
            error_type: "fetch_error",
            source: "fetchSightingDetails",
          });
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [instrument],
  );

  const fetchSummaryByLinkedSightingId = useCallback(
    async (linkedSightingId: string) => {
      setLoading(true);
      setError("");

      if (!linkedSightingId || !isValidUuid(linkedSightingId)) {
        log(`Sighting Details: Invalid linkedSightingId: ${linkedSightingId}`);
        setError("Error fetching sighting info. Please try again.");
        setLoading(false);
        return;
      }

      const repository = new SightingRepository();
      repository
        .getSightingByLinkedSightingId(linkedSightingId)
        .then((data) => {
          if (data) {
            setDetails({ summary: data, sightings: [] });
          }
        })
        .catch((error) => {
          const errorMessage = createErrorLogMessage(error);
          const log = `Failed to fetch sighting summary for linked sighting: ${errorMessage}`;
          setError("Error fetching sighting info. Please try again.");
          instrument?.failure({
            error_message: log,
            error_type: "fetch_error",
            source: "getSightingByLinkedSightingId",
          });
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [instrument],
  );

  useEffect(() => {
    if (sightingId && linkedSightingId) {
      fetchSightingDetails(sightingId, linkedSightingId);
    }

    if (linkedSightingId && !sightingId) {
      // We do not have a sightingId for the report, so we need to fetch the summary by linkedSightingId
      fetchSummaryByLinkedSightingId(linkedSightingId);
    }
  }, [
    sightingId,
    linkedSightingId,
    fetchSightingDetails,
    fetchSummaryByLinkedSightingId,
  ]);

  return {
    loading,
    error,
    timeline: details?.sightings,
    summary: details?.summary,
  };
}
