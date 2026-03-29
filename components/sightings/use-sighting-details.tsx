import { useCallback, useEffect, useState } from "react";
import { SightingRepository } from "@/db/repositories/sighting-repository";
import { AggregatedSighting } from "@/db/models/sighting";
import { log } from "../logs";
import { createErrorLogMessage } from "../util";

export function usePetSightings(sightingId: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [timeline, setTimeline] = useState<AggregatedSighting[]>([]);
  const [summary, setSummary] = useState<AggregatedSighting>();

  const fetchSummary = useCallback(async (sightingId: string) => {
    setLoading(true);
    setError("");

    const repository = new SightingRepository();
    repository
      .getSighting(sightingId)
      .then((data) => {
        if (data) {
          setSummary(data);
        }
      })
      .catch((error) => {
        const errorMessage = createErrorLogMessage(error);
        log(`Failed to fetch sighting summary for sighting: ${errorMessage}`);
        setError("Error fetching sighting info.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const fetchSightingsBySightingId = useCallback(async (sightingId: string) => {
    setLoading(true);
    setError("");

    const repository = new SightingRepository();
    repository
      .getLinkedSightings(sightingId)
      .then((data) => {
        if (data && data.length > 0) {
          setTimeline(data);
        }
      })
      .catch((error) => {
        const errorMessage = createErrorLogMessage(error);
        log(`Failed to fetch linked sightings for sighting: ${errorMessage}`);
        setError("Error fetching sighting info.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchSummary(sightingId);
    fetchSightingsBySightingId(sightingId);
  }, [sightingId, fetchSummary, fetchSightingsBySightingId]);

  return { loading, error, timeline, summary };
}
