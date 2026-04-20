import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface reqPayload {
  sightingId: string;
  userLocationLat: number;
  userLocationLong: number;
  sightingRadiusKm: number;
}

const matchThreshold = -0.8;
const matchCount = 5;
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !supabaseKey) {
  const error = "Supabase environment variables are not set properly";
  throw new Error(error);
}

const supabaseClient = createClient(supabaseUrl, supabaseKey);

function getErrorResponse(error: string, status: number = 400, code?: string) {
  return new Response(
    JSON.stringify({
      error,
      success: false,
      code,
    }),
    {
      headers: { "Content-Type": "application/json" },
      status,
    },
  );
}

function getSuccessResponse(message: string, data: any = []) {
  return new Response(
    JSON.stringify({
      success: true,
      message,
      data,
    }),
    {
      headers: { "Content-Type": "application/json" },
      status: 200,
    },
  );
}

async function findNearestSightings(
  sightingRadiusKm: number,
  userLocationLat: number,
  userLocationLong: number,
) {
  const lastUpdateThreshold = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000,
  ).toISOString(); // last 30 days
  const lat = userLocationLat;
  const lng = userLocationLong;
  // ~111 km per 1 degree latitude
  const latDegree = sightingRadiusKm / 111;
  // adjust longitude scaling by latitude
  const lngDegree = sightingRadiusKm / (111 * Math.cos(lat * (Math.PI / 180)));

  const minLat = lat - latDegree;
  const maxLat = lat + latDegree;
  const minLng = lng - lngDegree;
  const maxLng = lng + lngDegree;

  return supabaseClient
    .from("aggregated_sightings")
    .select("*")
    .eq("is_active", true)
    .not("pet_description_id", "is", null)
    .gte("last_seen_lat", minLat)
    .lte("last_seen_lat", maxLat)
    .gte("last_seen_long", minLng)
    .lte("last_seen_long", maxLng)
    .gte("updated_at", lastUpdateThreshold);
}

async function findSighting(sightingId: string) {
  return supabaseClient
    .from("aggregated_sightings")
    .select(`*, pet_desc_results(*)`)
    .eq("id", sightingId);
}

async function findMatchingSightings(
  petEmbeddings: number[][],
  nearbyPetDescriptionIds: string[],
) {
  return supabaseClient.rpc("match_pet_sightings", {
    pet_embeddings: petEmbeddings,
    match_count: matchCount,
    match_threshold: matchThreshold,
    candidate_ids: nearbyPetDescriptionIds,
  });
}

async function saveMatches(
  matchResultsToSave: {
    sighting_id?: string;
    pet_description_id: string;
    matches: string;
  }[],
) {
  return supabaseClient.from("sighting_matches").insert(matchResultsToSave);
}

Deno.serve(async (req: Request) => {
  const {
    sightingId,
    userLocationLat,
    userLocationLong,
    sightingRadiusKm,
  }: reqPayload = await req.json();

  if (
    !sightingId ||
    !userLocationLat ||
    !userLocationLong ||
    !sightingRadiusKm
  ) {
    return getErrorResponse("Missing required parameters");
  }

  let petEmbeddings;
  let matchResults;
  let petEmbeddingId;
  let nearbyPetDescriptionIds: string[] = [];

  try {
    const { data, error } = await findSighting(sightingId);
    if (error) {
      return getErrorResponse(error.message, 500);
    }

    if (!data || data.length === 0 || !data[0].pet_desc_results) {
      return getSuccessResponse("No matches found");
    }

    petEmbeddings = data[0].pet_desc_results.embeddings;
    petEmbeddingId = data[0].pet_desc_results.id;
  } catch (error) {
    return getErrorResponse(
      error instanceof Error ? error.message : String(error),
      500,
    );
  }

  try {
    const nearestSightings = await findNearestSightings(
      sightingRadiusKm,
      userLocationLat,
      userLocationLong,
    );
    if (nearestSightings.error) {
      return getErrorResponse(nearestSightings.error.message, 500);
    }

    if (!nearestSightings.data || nearestSightings.data.length === 0) {
      return getSuccessResponse("No nearby sightings found");
    }

    nearbyPetDescriptionIds = nearestSightings.data
      .map((s: any) => s.pet_description_id)
      .filter((id: string | null) => id !== null);

    if (nearbyPetDescriptionIds.length === 0) {
      return getSuccessResponse(
        "No nearby sightings with pet descriptions found",
      );
    }
  } catch (error) {
    return getErrorResponse(
      error instanceof Error ? error.message : String(error),
      500,
    );
  }

  try {
    matchResults = await findMatchingSightings(
      petEmbeddings,
      nearbyPetDescriptionIds,
    );
    if (!matchResults || !matchResults.data || matchResults.data.length === 0) {
      return getSuccessResponse("No matches found");
    }
  } catch (error) {
    return getErrorResponse(
      error instanceof Error ? error.message : String(error),
      500,
    );
  }

  try {
    const matchResultsData = matchResults.data;
    let i = 0;
    const matchResultsToSave = [];
    const matchesStringified = JSON.stringify([
      ...matchResults.data,
      { match_id: petEmbeddingId, similarity_score: 1 },
    ]);

    matchResultsToSave.push({
      sighting_id: sightingId,
      pet_description_id: petEmbeddingId,
      matches: matchesStringified,
    });

    for (i = 0; i < matchResultsData.length; i++) {
      const id = matchResultsData[i].match_id;
      matchResultsToSave.push({
        pet_description_id: id,
        matches: matchesStringified,
      });
    }

    // save matching description IDs
    const { error } = await saveMatches(matchResultsToSave);
    if (error) {
      return getErrorResponse(error.message, 500);
    }
  } catch (error) {
    return getErrorResponse(
      error instanceof Error ? error.message : String(error),
      500,
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
    }),
    {
      headers: { "Content-Type": "application/json" },
      status: 200,
    },
  );
});
