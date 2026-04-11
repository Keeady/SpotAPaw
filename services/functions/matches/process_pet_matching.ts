import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface reqPayload {
  sightingId: string;
}

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

Deno.serve(async (req: Request) => {
  const { sightingId }: reqPayload = await req.json();

  if (!sightingId) {
    return getErrorResponse("Missing sightingId");
  }

  let petEmbeddings;
  let matchResults;
  let petEmbeddingId;

  try {
    const { data, error } = await supabaseClient
      .from("aggregated_sightings")
      .select(`*, pet_desc_results(*)`)
      .eq("id", sightingId);

    if (error) {
      return getErrorResponse(error.message, 500);
    }

    if (
      !data ||
      data.length === 0 ||
      !data[0].pet_desc_results
    ) {
      return getErrorResponse("No matches found", 404);
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
    matchResults = await supabaseClient.rpc("match_pet_sightings", {
      pet_embeddings: petEmbeddings,
      match_count: 5,
      exclude_id: petEmbeddingId
    });

  } catch (error) {
    return getErrorResponse(
      error instanceof Error ? error.message : String(error),
      500,
    );
  }

  if (!matchResults || !matchResults.data || matchResults.data.length === 0) {
    return getErrorResponse("No matches found", 404);
  }

  try {
    const matchResultsData = matchResults.data;
    let i = 0;
    const matchResultsToSave = [];
    const matchesStrigified = JSON.stringify([...matchResults.data,
    { match_id: petEmbeddingId, similarity_score: 1 }]);

    matchResultsToSave.push({
      sighting_id: sightingId,
      pet_description_id: petEmbeddingId,
      matches: matchesStrigified
    });

    for (i = 0; i < matchResultsData.length; i++) {
      const id = matchResultsData[i].match_id;
      matchResultsToSave.push({
        pet_description_id: id,
        matches: matchesStrigified,
      })
    }

    // save matching description IDs
    const { error } = await supabaseClient.from("sighting_matches").insert(matchResultsToSave);

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
