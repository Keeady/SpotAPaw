import { useCallback, useEffect, useState } from "react";
import { SightingRepository } from "@/db/repositories/sighting-repository";
import { AggregatedSighting } from "@/db/models/sighting";
import { log } from "../logs";
import { createErrorLogMessage, isValidUuid } from "../util";
import { useTelemetryProvider } from "@/instrumentation/telemetry-provider";

export function usePetSightings(sightingId: string, linkedSightingId: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [timeline, setTimeline] = useState<AggregatedSighting[]>([]);
  const [summary, setSummary] = useState<AggregatedSighting>();
  const { instrument } = useTelemetryProvider();

  const fetchSummary = useCallback(async (sightingId: string) => {
    setLoading(true);
    setError("");

    if (!sightingId || !isValidUuid(sightingId)) {
      log(`Sighting Details: Invalid sightingId: ${sightingId}`);
      setError("Error fetching sighting info.");
      setLoading(false);

      instrument({
        eventName: "sighting_detail_event",
        step: "request_sent",
        status: "incomplete",
        eventData: {
          sub_request: "fetch_sighting_summary",
        },
      });
      return;
    }

    const repository = new SightingRepository();
    repository
      .getSighting(sightingId)
      .then((data) => {
        if (data) {
          setSummary(data);
        }

        instrument({
          eventName: "sighting_detail_event",
          step: "request_completed",
          status: "success",
          eventData: {
            sub_request: "fetch_sighting_summary",
          },
        });
      })
      .catch((error) => {
        const errorMessage = createErrorLogMessage(error);
        log(`Failed to fetch sighting summary for sighting: ${errorMessage}`);
        setError("Error fetching sighting info. Please try again.");

        instrument({
          eventName: "sighting_detail_event",
          step: "request_completed",
          status: "failed",
          eventData: {
            sub_request: "fetch_sighting_summary",
          },
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

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
            setSummary(data);
          }
        })
        .catch((error) => {
          const errorMessage = createErrorLogMessage(error);
          log(
            `Failed to fetch sighting summary for linked sighting: ${errorMessage}`,
          );
          setError("Error fetching sighting info. Please try again.");
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [],
  );

  const fetchSightingsByLinkedSightingId = useCallback(
    async (linkedSightingId: string) => {
      setLoading(true);
      setError("");

      if (!linkedSightingId || !isValidUuid(linkedSightingId)) {
        log(
          `Sighting Details: Invalid linkedSightingId for timeline fetch: ${linkedSightingId}`,
        );
        setError("Error fetching sighting info. Please try again.");
        setLoading(false);

        instrument({
          eventName: "sighting_detail_event",
          step: "request_sent",
          status: "incomplete",
          eventData: {
            sub_request: "fetch_sighting_timeline",
          },
        });

        return;
      }

      const repository = new SightingRepository();
      repository
        .getLinkedSightings(linkedSightingId)
        .then((data) => {
          if (data && data.length > 0) {
            setTimeline(data);
          }

          instrument({
            eventName: "sighting_detail_event",
            step: "request_completed",
            status: "success",
            eventData: {
              sub_request: "fetch_sighting_timeline",
            },
          });
        })
        .catch((error) => {
          const errorMessage = createErrorLogMessage(error);
          log(`Failed to fetch linked sightings for sighting: ${errorMessage}`);
          setError("Error fetching sighting info. Please try again.");

          instrument({
            eventName: "sighting_detail_event",
            step: "request_completed",
            status: "failed",
            eventData: {
              sub_request: "fetch_sighting_timeline",
            },
          });
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [],
  );

  useEffect(() => {
    if (linkedSightingId && !sightingId) {
      // We do not have a sightingId for the report, so we need to fetch the summary by linkedSightingId
      fetchSummaryByLinkedSightingId(linkedSightingId);
    } else if (sightingId) {
      instrument({
        eventName: "sighting_detail_event",
        step: "request_sent",
        status: "success",
        eventData: {
          sub_request: "fetch_sighting_summary",
        },
      });
      fetchSummary(sightingId);
    }

    if (linkedSightingId) {
      instrument({
        eventName: "sighting_detail_event",
        step: "request_sent",
        status: "success",
        eventData: {
          sub_request: "fetch_sighting_timeline",
        },
      });
      fetchSightingsByLinkedSightingId(linkedSightingId);
    }
  }, [
    sightingId,
    linkedSightingId,
    fetchSummary,
    fetchSightingsByLinkedSightingId,
    fetchSummaryByLinkedSightingId,
  ]);

  return { loading, error, timeline, summary };
}
