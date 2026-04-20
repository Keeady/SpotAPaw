import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface reqPayload {
  description: string;
  id: string;
}

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const geminiApiKey = Deno.env.get("GOOGLE_GENAI_API_KEY");

if (!supabaseUrl || !supabaseKey || !geminiApiKey) {
  const error = "Missing environment variables";
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

function parseJsonResponse(text: string) {
  let cleanText = text.trim();

  // Remove markdown code blocks if present
  if (cleanText.startsWith("```json")) {
    cleanText = cleanText.substring(7);
  }
  if (cleanText.startsWith("```")) {
    cleanText = cleanText.substring(3);
  }
  if (cleanText.endsWith("```")) {
    cleanText = cleanText.substring(0, cleanText.length - 3);
  }

  return JSON.parse(cleanText.trim());
}

async function getEmbedding(apiKey: string, text: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent`;
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      model: "models/gemini-embedding-001",
      content: { parts: [{ text }] },
    }),
  });
}

function petToText(pet: Record<string, any>): string {
  const intro = `${pet.species} is a ${pet.size} size ${pet.breed}.`;
  const colors = pet.colors ? `Colors: ${pet.colors}.` : '';
  const collar = pet.collar_descriptions ? `Collar Description: ${pet.collar_descriptions.join(', ')}.` : '';
  const features = pet.distinctive_features ? `Distinctive Features: ${pet.distinctive_features.join(', ')}.` : '';
  
  return [
    intro,
    colors,
    collar,
    features,
  ].filter(Boolean).join(' ')
};

function findDescription(id: string) {
  return supabaseClient
    .from("pet_desc_results")
    .select("description")
    .eq("id", id);
}

Deno.serve(async (req: Request) => {
  const { id }: reqPayload = await req.json();

  if (!id) {
    return getErrorResponse("Missing id");
  }

  let embeddings;
  let description;
  
  try {
    const { data, error } = await findDescription(id);
    if (error) {
      return getErrorResponse("Error fetching description from db", 500);
    }

    if (!data || data.length === 0) {
      return getErrorResponse("No description found for the given id", 404);
    }

    description = data[0].description;
    embeddings = data[0].embeddings;

    if (embeddings) {
      return getErrorResponse("Embeddings already exist for this description", 400);
    }
  } catch (error) {
    return getErrorResponse("Error while fetching description from db", 500);
  }

  try {
    const parsedDescription = parseJsonResponse(description);
    if (
      !parsedDescription.pets ||
      !Array.isArray(parsedDescription.pets) ||
      parsedDescription.pets.length === 0
    ) {
      return getErrorResponse(
        "Description must include a non-empty pets array",
      );
    }

    const pet = parsedDescription.pets[0];
    const petText = petToText(pet);

    const response = await getEmbedding(geminiApiKey, petText);
    if (!response.ok) {
      const errorText = await response.text();
      return getErrorResponse(errorText, 500);
    }

    const data = await response.json();
    if (!data || !data.embedding || !data.embedding.values) {
      return getErrorResponse("Invalid response from Gemini API", 500);
    }
    embeddings = data.embedding.values;

    if (!embeddings) {
      return getErrorResponse("Failed to get embedding from Gemini API", 500);
    }
  } catch (error) {
    return getErrorResponse(
      "Error while processing embedding from Gemini API",
      500,
    );
  }

  try {
    const { error } = await supabaseClient
      .from("pet_desc_results")
      .update({
        embeddings,
      })
      .eq("id", id);

    if (error) {
      return getErrorResponse("Failed to update db with new embeddings", 500);
    }
  } catch (error) {
    return getErrorResponse("Error while updating pet description", 500);
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
