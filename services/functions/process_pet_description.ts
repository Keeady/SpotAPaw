import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface reqPayload {
  description: string;
  id: string;
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

Deno.serve(async (req: Request) => {
  const { description, id }: reqPayload = await req.json();

  if (!description || !id) {
    return getErrorResponse("Missing description or id");
  }

  const geminiApiKey = Deno.env.get("GOOGLE_GENAI_API_KEY");
  if (!geminiApiKey) {
    const error = "GOOGLE_GENAI_API_KEY environment variable is not set";

    return getErrorResponse(error, 500);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");

  if (!supabaseUrl) {
    const error = "SUPABASE_URL environment variable is not set";

    return getErrorResponse(error, 500);
  }

  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseKey) {
    const error = "SUPABASE_SERVICE_ROLE_KEY environment variable is not set";

    return getErrorResponse(error, 500);
  }

  let supabaseClient;
  let embeddings;

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

    const response = await getEmbedding(geminiApiKey, JSON.stringify(pet));
    if (!response.ok) {
      const errorText = await response.text();
      return getErrorResponse(errorText, 500);
    }

    const data = await response.json();
    embeddings = data.embedding.values;

    if (!embeddings) {
      return getErrorResponse("Failed to get embedding from Gemini API", 500);
    }
  } catch (error) {
    return getErrorResponse(
      "Error while getting embedding from Gemini API",
      500,
    );
  }

  try {
    supabaseClient = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabaseClient
      .from("pet_desc_results")
      .update({
        embeddings,
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return getErrorResponse("Failed to update db with new embeddings", 500);
    }

    if (!data) {
      return getErrorResponse(
        "Failed to update pet description with embedding",
        500,
      );
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
