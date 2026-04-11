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

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !supabaseKey) {
  const error = "Supabase environment variables are not set properly";
  throw new Error(error);
}

const supabaseClient = createClient(supabaseUrl, supabaseKey);

let matchResults;

Deno.serve(async (req: Request) => {
  const { sightingId, petDescriptionId }: reqPayload = await req.json();

  if (!sightingId || !petDescriptionId) {
    return getErrorResponse("Missing parameters");
  }

  try {
    const { data, error } = await supabaseClient
      .from("sighting_matches")
      .select("*")
      .or(
        `sighting_id.eq.${sightingId}, pet_description_id.eq.${petDescriptionId}`
      )
      .order("created_at", { ascending: false });
    
    if (error) {
      return getErrorResponse(error.message, 500);
    }

    if (!data || data.length === 0) {
      return getErrorResponse("No matches found", 404);
    }

    matchResults = data[0].matches;
  } catch (error) {
    return getErrorResponse("Error fetching pet matching results", 500);
  }

  try {
    const parsedMatches = JSON.parse(matchResults);
    if (!parsedMatches || parsedMatches.length === 0) {
      return getErrorResponse("No parsed matches", 200);
    }

    const matchIds = [];
    let i = 0;
    for (i = 0; i < parsedMatches.length; i++) {
      matchIds.push(parsedMatches[i].match_id)
    }

    const { data: matchDetails, error: matchDetailsError } =
      await supabaseClient.from("aggregated_sightings").select("*").in("pet_description_id", matchIds);

    const data = matchDetails
      .map(item => {
        const score = parsedMatches.find(m => m.match_id === item.pet_description_id)?.similarity_score ?? 0;

        return {
          ...item,
          similarity_score: score > 1 ? 100 : score * 100
        }
      })
      .sort((a, b) => b.similarity_score - a.similarity_score)

    if (matchDetailsError) {
      return getErrorResponse(matchDetailsError.message, 500);
    }

    if (!data) {
      return getErrorResponse("No match details found", 404);
    }

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
