import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface reqPayload {
  sightingId: string;
  isAiFeatureEnabled?: boolean;
}

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const geminiApiKey = Deno.env.get("GOOGLE_GENAI_API_KEY");

if (!supabaseUrl || !supabaseKey || !geminiApiKey) {
  const error = "Missing environment variables";
  throw new Error(error);
}

const supabaseClient = createClient(supabaseUrl, supabaseKey);

function getErrorResponse(
  message: string,
  status: number = 400,
  code?: string,
) {
  return new Response(
    JSON.stringify({
      message,
      success: false,
      code,
    }),
    {
      headers: { "Content-Type": "application/json" },
      status,
    },
  );
}

async function findExistingPosterForSighting(sightingId: string) {
  const { data, error } = await supabaseClient
    .from("posters")
    .select("*")
    .eq("sighting_id", sightingId);

  if (error) {
    throw error;
  }

  if (!data || data.length === 0) {
    return null;
  }

  return data[0];
}

async function getPosterDataFromSighting(sightingId: string) {
  const { data, error } = await supabaseClient
    .from("aggregated_sightings")
    .select("*")
    .eq("id", sightingId);

  if (error) {
    throw error;
  }

  if (!data || data.length === 0) {
    return null;
  }

  return data[0];
}

async function getPetDescriptionById(petDescriptionId: string) {
  const { data, error } = await supabaseClient
    .from("pet_desc_results")
    .select("*")
    .eq("id", petDescriptionId);
  if (error) {
    throw error;
  }

  if (!data || data.length === 0) {
    return null;
  }
  return data[0];
}

function petToText(pet: any): string {
  const intro = `${pet.species} is a ${pet.size} size ${pet.breed}.`;
  const colors = pet.colors ? `Colors: ${pet.colors}.` : "";
  const collar = pet.collar_descriptions
    ? `Collar Description: ${pet.collar_descriptions}.`
    : "";
  const features = pet.features ? `Distinctive Features: ${pet.features}.` : "";

  return [intro, colors, collar, features].filter(Boolean).join(" ");
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

async function fetchAiResponse(
  posterAiPayload: any,
  isAiFeatureEnabled: boolean,
  posterType: string,
) {
  const AiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`;

  const prompt = `Write a ${posterType === "lost" ? "lost" : "found"} pet poster copy from structured pet data.
Return ONLY valid JSON:
{
  "headline": "LOST DOG or LOST CAT or FOUND DOG or FOUND CAT — 2 words, uppercase",
  "subheadline": "one warm sentence asking for help finding them",
  "description": "2-3 sentences: physical description, temperament, what makes them identifiable. Warm, human tone.",
  "cta": "one sentence telling people what to do if they see the pet",
  "lastSeenLocation": "extract the street name and city from the last seen location, if available",
  "lastSeenDate": "extract the date from the last seen time, if available, format as Month Day, Year"
}`;

  const payload = JSON.stringify({
    contents: [
      {
        parts: [
          { text: prompt },
          {
            text: JSON.stringify(posterAiPayload),
          },
        ],
      },
    ],
  });

  const response = await fetch(AiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": geminiApiKey,
    },
    body: payload,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(errorText);
    return new Response(errorText, {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }

  const responseData = await response.json();

  // Extract text from response
  if (
    !responseData ||
    !responseData.candidates ||
    responseData.candidates.length === 0
  ) {
    const error = "No response from Gemini API";
    return getErrorResponse(error, 500);
  }

  const textResponse = responseData.candidates[0].content?.parts?.[0].text;
  if (!textResponse) {
    const error = "Empty response from Gemini API";
    return getErrorResponse(error, 500);
  }

  let parsedResponse;
  try {
    parsedResponse = parseJsonResponse(textResponse);
  } catch (error) {
    console.error("Error parsing Gemini API response:", error);
    return getErrorResponse("Invalid JSON response from Gemini API", 500);
  }

  return parsedResponse;
}

async function savePosterToDatabase(poster: any) {
  const { data, error } = await supabaseClient
    .from("posters")
    .insert([poster])
    .select("*");

  if (error) {
    throw error;
  }

  if (!data || data.length === 0) {
    return null;
  }

  return data[0];
}

Deno.serve(async (req: Request) => {
  const { sightingId, isAiFeatureEnabled } = (await req.json()) as reqPayload;
  
  let posterType = "lost"; // Default to "lost"

  if (!sightingId) {
    const error = "Missing required parameters";
    return getErrorResponse(error, 400);
  }

  try {
    const poster = await findExistingPosterForSighting(sightingId);

    if (poster) {
      return new Response(JSON.stringify(poster), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Error checking existing poster:", error);
    const errorMessage = "Internal server error";
    return getErrorResponse(errorMessage, 500);
  }

  try {
    const sightingData = await getPosterDataFromSighting(sightingId);

    if (!sightingData) {
      const error = "Failed to generate poster";
      return getErrorResponse(error, 500);
    }

    const {
      species,
      photos,
      name,
      features,
      pet_description_id,
      gender,
      owner_id,
    } = sightingData;
    let bestPhotoUrl = null;

    if (pet_description_id) {
      const petDescription = await getPetDescriptionById(pet_description_id);
      bestPhotoUrl = petDescription?.best_photo_url || null;
    }

    if (owner_id) {
      posterType = "lost";
    } else {
      posterType = "found";
    }

    const posterPayload = {
      name: name || "Unknown",
      breed: sightingData.breed || "",
      species: species || "",
      lastSeenLocation: sightingData.last_seen_location || "",
      lastSeenDate: sightingData.last_seen_time || "",
      note: sightingData.note || "",
      behavior: sightingData.behavior || "",
      age: sightingData.age || "",
      size: sightingData.size || "",
      colors: sightingData.colors || "",
      collarDescription: sightingData.collar_description || [],
      features: features || [],
      gender: gender || "",
    };

    let posterResponse;
    if (isAiFeatureEnabled) {
      posterResponse = await fetchAiResponse(
        posterPayload,
        isAiFeatureEnabled,
        posterType,
      );
    } else {
      posterResponse = {
        headline:
          posterType === "lost" ? `Lost ${species}` : `Found ${species}`,
        subheadline:
          posterType === "lost"
            ? `Have you seen this ${species}?`
            : `Do you know this ${species}?`,
        description: petToText(posterPayload),
        cta: `If you see ${name || "this pet"}, please contact us.`,
        lastSeenLocation: posterPayload.lastSeenLocation || "",
        lastSeenDate: posterPayload.lastSeenDate || "",
      };
    }

    const headline =
      posterResponse.headline ||
      (posterType === "lost" ? `Lost ${species}` : `Found ${species}`);
    const subheadline =
      posterResponse.subheadline ||
      (posterType === "lost"
        ? `Have you seen this ${species}?`
        : `Do you know this ${species}?`);
    const posterPhoto = photos.length > 0 ? photos[0] : null;
    const description = posterResponse.description || petToText(sightingData);
    const cta =
      posterResponse.cta ||
      `If you see ${name || "this pet"}, please contact us.`;
    const lastSeenLocation =
      posterResponse.lastSeenLocation || sightingData.last_seen_location || "";
    const lastSeenDate =
      posterResponse.lastSeenDate || sightingData.last_seen_time || "";

    const poster = {
      sighting_id: sightingId,
      headline,
      subheadline,
      photo_url: bestPhotoUrl || posterPhoto || null,
      description,
      cta,
      last_seen_location: lastSeenLocation,
      last_seen_time: lastSeenDate,
      contact_name: sightingData.reporter_name || "",
      contact_phone: sightingData.reporter_phone || "",
      name: name || "Unknown",
      breed: sightingData.breed || "",
      colors: sightingData.colors || "",
    };

    const savedPoster = await savePosterToDatabase(poster);

    if (!savedPoster) {
      const errorMessage = "Failed to save poster to database";
      return getErrorResponse(errorMessage, 500);
    }

    return new Response(JSON.stringify(savedPoster), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating poster:", error);
    const errorMessage = "Internal server error";
    return getErrorResponse(errorMessage, 500);
  }
});
