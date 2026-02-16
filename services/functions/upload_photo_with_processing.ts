import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface reqPayload {
  photo: string;
  filename: string;
  filetype: string;
  prompt: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg"];

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
  const { photo, filename, filetype, prompt }: reqPayload = await req.json();

  if (!photo || !filename || !filetype || !prompt) {
    const error = "Missing required parameters";

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

  const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!supabaseKey) {
    const error = "SUPABASE_ANON_KEY environment variable is not set";

    return getErrorResponse(error, 500);
  }

  let photoPublicUrl = "";

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

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
    const AiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;

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

    return new Response(
      JSON.stringify({
        success: true,
        result: textResponse,
        publicUrl: photoPublicUrl,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    return getErrorResponse("Failed to process photo", 500);
  }
});
