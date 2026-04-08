import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encodeHex } from "jsr:@std/encoding/hex";

interface reqPayload {
  photo: string;
  filename: string;
  filetype: string;
  hash: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png"];

const prompt = `Analyze this image and extract detailed information about any pets visible.

For EACH pet in the image, provide the following information in JSON format:
{
  "pets": [
    {
      "species": "dog/cat/bird/rabbit/etc.",
      "breed": "breed identification",
      "colors": ["primary color", "secondary color", "pattern description"],
      "size": "small/medium/large",
      "distinctive_features": ["feature 1", "feature 2", "feature 3"],
      "collar_descriptions": ["description 1", "description 2", "description 3"],
      "confidence": "high/medium/low"
    }
  ],
  "image_quality": "good/fair/poor",
  "number_of_pets": 1
}

Guidelines:
- **Species**: The type of animal (dog, cat, bird, rabbit, hamster, horse, etc.)
- **Breed Identification** (IMPORTANT):
  - Set "breed" to a descriptive format: "[Dominant Breed] mix" or "[Breed 1] [Breed 2] mix"
  - If you can identify 1-2 specific breeds in the mix, name them (e.g., "German Shepherd Husky mix")
  - If you can identify only the dominant breed, use that (e.g., "German Shepherd mix")
  - If completely uncertain, use "Mixed breed" or "unknown"
- **Colors**: List all visible colors and any patterns (e.g., "brindle", "tabby", "spotted", "merle")
- **Size**: 
  - Small: Under 20 lbs (9 kg) for dogs, small cats, small animals
  - Medium: 20-50 lbs (9-23 kg) for dogs, average cats
  - Large: Over 50 lbs (23 kg) for dogs, large cats
- **Distinctive Features**: 
  - Notable characteristics like "floppy ears", "short tail", "blue eyes", "white chest patch", "wrinkled face", "long fur", "pointed ears", etc.
- **Collar, Tag, or Harness**:
  - Describe Collar, tag, or harness found on the pet such as colors, patterns, and extract any visible writings or brandings

If NO pets are visible in the image, return:
{
  "pets": [],
  "note": "No pets detected in image"
}

Respond ONLY with valid JSON. Do not include any other text or markdown formatting.`;

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

async function getFileHash(base64String: string): Promise<string> {
  const data = new TextEncoder().encode(base64String);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return encodeHex(new Uint8Array(hashBuffer));
}

Deno.serve(async (req: Request) => {
  const { photo, filename, filetype, hash }: reqPayload = await req.json();

  if (!photo || !filename || !filetype || !hash) {
    const error = "Missing required parameters";

    return getErrorResponse(error);
  }

  const hashCheck = await getFileHash(photo);
  if (hash != hashCheck) {
    const error = "Hash mismatch";
    return getErrorResponse(error);
  }

  if (!ALLOWED_TYPES.includes(filetype)) {
    const error = "Invalid file type";
    return getErrorResponse(error);
  }

  const base64Regex = /^data:([a-zA-Z0-9+/.-]+);base64,(.+)$/;
  const match = photo.match(base64Regex);

  if (!match) {
    const error = "Invalid file format";
    return getErrorResponse(error);
  }

  const mimeFromBase64 = match[1];
  const photoData = match[2];

  if (mimeFromBase64 !== filetype) {
    const error = "MIME type mismatch";
    return getErrorResponse(error);
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

  let photoPublicUrl = "";
  let supabaseClient;
  let petDescriptionResultId = "";

  try {
    // Initialize Supabase client
    supabaseClient = createClient(supabaseUrl, supabaseKey);

    // check if file with same hash already exists in storage
    const { data: existingFile } = await supabaseClient
      .from("pet_desc_results")
      .select("*")
      .eq("photo_hash", hash);

    if (existingFile && existingFile.length > 0) {
      const existingPhotoPublicUrl = existingFile[0].public_url;
      const existingPetDescription = existingFile[0].description;
      const existingPetDescriptionId = existingFile[0].id;

      if (existingPhotoPublicUrl && existingPetDescription) {
        return new Response(
          JSON.stringify({
            success: true,
            result: existingPetDescription,
            publicUrl: existingPhotoPublicUrl,
            petDescriptionId: existingPetDescriptionId,
          }),
          {
            headers: { "Content-Type": "application/json" },
            status: 200,
          },
        );
      }
    }

    // No existing file, proceed with upload and processing

    const binaryString = atob(photoData);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    if (bytes.length > MAX_FILE_SIZE) {
      const error = "File size exceeds max allowed";
      return getErrorResponse(error, 400, "MAX_FILE_SIZE_ERROR");
    }

    const filePath = `ai_sightings/${filename}`;
    // Upload to Supabase Storage
    const { error } = await supabaseClient.storage
      .from("pet_photos")
      .upload(filePath, bytes, {
        contentType: filetype,
        upsert: false,
      });

    if (error) {
      let msg = "Failed to save photo.";

      return getErrorResponse(msg, 500);
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabaseClient.storage.from("pet_photos").getPublicUrl(filePath);

    photoPublicUrl = publicUrl;
  } catch {
    const error = "Failed to save or get photo.";
    return getErrorResponse(error, 500);
  }

  try {
    const AiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`;

    const payload = JSON.stringify({
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: filetype,
                data: photoData,
              },
            },
            { text: prompt },
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

    // Save result to Supabase
    const { data: insertedData } = await supabaseClient.from("pet_desc_results").insert({
      photo_hash: hash,
      description: textResponse,
      public_url: photoPublicUrl,
    }).select("id");

    if (insertedData && insertedData.length > 0) {
      petDescriptionResultId = insertedData[0].id;
    }

    return new Response(
      JSON.stringify({
        success: true,
        result: textResponse,
        publicUrl: photoPublicUrl,
        petDescriptionId: petDescriptionResultId,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch {
    return getErrorResponse("Failed to process photo", 500);
  }
});
