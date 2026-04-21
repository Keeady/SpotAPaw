/**
 * This function is responsible for retrieving pet matching results for a given sighting.
 * It accepts a sighting ID and pet description ID as input, 
 * checks the sighting_matches table for existing matches,
 * and returns the matching sightings sorted by similarity score.
 * If no matches are found, it returns a success response with an empty data array.
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface reqPayload {
  sightingId: string;
  petDescriptionId: string;
}

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

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !supabaseKey) {
  const error = "Supabase environment variables are not set properly";
  throw new Error(error);
}

const supabaseClient = createClient(supabaseUrl, supabaseKey);

Deno.serve(async (req: Request) => {
  const { sightingId, petDescriptionId }: reqPayload = await req.json();

  if (!sightingId || !petDescriptionId) {
    return getErrorResponse("Missing parameters");
  }

  let matchResults;

  try {
    const { data, error } = await supabaseClient
      .from("sighting_matches")
      .select("*")
      .or(
        `sighting_id.eq.${sightingId}, pet_description_id.eq.${petDescriptionId}`,
      )
      .order("created_at", { ascending: false });

    if (error) {
      return getErrorResponse(error.message, 500);
    }

    if (!data || data.length === 0) {
      return getSuccessResponse("No matches found");
    }

    matchResults = data[0].matches;
  } catch (error) {
    return getErrorResponse("Error fetching pet matching results", 500);
  }

  try {
    const parsedMatches = JSON.parse(matchResults);
    if (!parsedMatches || parsedMatches.length === 0) {
      return getSuccessResponse("No parsed matches");
    }

    const matchIds = [];
    let i = 0;
    for (i = 0; i < parsedMatches.length; i++) {
      matchIds.push(parsedMatches[i].match_id);
    }

    const { data: matchDetails, error: matchDetailsError } =
      await supabaseClient
        .from("aggregated_sightings")
        .select("*")
        .in("pet_description_id", matchIds);

    if (matchDetailsError) {
      return getErrorResponse(matchDetailsError.message, 500);
    }

    if (!matchDetails) {
      return getErrorResponse("No match details found", 404);
    }

    const data = matchDetails
      .map((item) => {
        const score =
          parsedMatches.find((m) => m.match_id === item.pet_description_id)
            ?.similarity_score ?? 0;

        return {
          ...item,
          similarity_score: score > 1 ? 100 : score * 100,
        };
      })
      .sort((a, b) => b.similarity_score - a.similarity_score);

    return new Response(
      JSON.stringify({
        success: true,
        data,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    return getErrorResponse("Error fetching match details", 500);
  }
});
