import { SightingRepository } from "@/db/repositories/sighting-repository";
import { SightingReport } from "./wizard-interface";
import { SIGHTING_RADIUSKM } from "../constants";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { createErrorLogMessage, isValidUuid } from "../util";
import { log } from "../logs";

  export async function findMatches(sightingId: string, sightingFormData: SightingReport) {
    if (!sightingId || !isValidUuid(sightingId)) {
      return;
    }

    const repository = new SightingRepository();

    const userLocationLat = sightingFormData.lastSeenLat;
    const userLocationLong = sightingFormData.lastSeenLong;
    const sightingRadiusKm = SIGHTING_RADIUSKM;

    return repository
      .findMatchingSightings(
        sightingId,
        userLocationLat,
        userLocationLong,
        sightingRadiusKm,
      )
      .catch(async (error) => {
        if (error instanceof FunctionsHttpError) {
          const errorContext = await error.context.json().catch(() => null);
          log(`Error processing matching sightings: ${errorContext?.message}`);
        } else {
          const errorMessage = createErrorLogMessage(error);
          log(`Error processing matching sightings: ${errorMessage}`);
        }
      });
    };