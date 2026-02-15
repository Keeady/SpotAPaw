import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface reqPayload {
  photo: string;
  filename: string;
  filetype: string;
  prompt: string;
}

Deno.serve(async (req: Request) => {
  const { photo, filename, filetype, prompt }: reqPayload = await req.json();

  if (!photo || !filename || !filetype || !prompt) {
    const error = new Error("Missing required parameters");

    return new Response(
      JSON.stringify({
        success: false,
        error,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      },
    );
  }

  const photoData = photo.includes(",") ? photo.split(",")[1] : photo;

  const geminiApiKey = Deno.env.get("GOOGLE_GENAI_API_KEY");
  if (!geminiApiKey) {
    const error = new Error(
      "GOOGLE_GENAI_API_KEY environment variable is not set",
    );

    return new Response(
      JSON.stringify({
        success: false,
        error,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      },
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");

  if (!supabaseUrl) {
    const error = new Error("SUPABASE_URL environment variable is not set");

    return new Response(
      JSON.stringify({
        success: false,
        error,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      },
    );
  }

  const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!supabaseKey) {
    const error = new Error(
      "SUPABASE_ANON_KEY environment variable is not set",
    );

    return new Response(
      JSON.stringify({
        success: false,
        error,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      },
    );
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

    const filePath = `ai_sightings/${filename}`;
    // Upload to Supabase Storage
    const { error } = await supabaseClient.storage
      .from("pet_photos")
      .upload(filePath, bytes, {
        contentType: filetype,
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabaseClient.storage.from("pet_photos").getPublicUrl(filePath);

    photoPublicUrl = publicUrl;
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Failed to save photo.",
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      },
    );
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
      const responseError = JSON.parse(errorText);

      return new Response(
        JSON.stringify({
          success: false,
          error: responseError.error,
        }),
        {
          headers: { "Content-Type": "application/json" },
          status: 200,
        },
      );
    }

    const responseData = await response.json();

    // Extract text from response
    if (
      !responseData ||
      !responseData.candidates ||
      responseData.candidates.length === 0
    ) {
      const error = new Error("No response from Gemini API");
      return new Response(
        JSON.stringify({
          success: false,
          error,
        }),
        {
          headers: { "Content-Type": "application/json" },
          status: 200,
        },
      );
    }

    const textResponse = responseData.candidates[0].content?.parts?.[0].text;
    if (!textResponse) {
      const error = new Error("Empty response from Gemini API");
      return new Response(
        JSON.stringify({
          success: false,
          error,
        }),
        {
          headers: { "Content-Type": "application/json" },
          status: 200,
        },
      );
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
    return new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to process photo.",
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      },
    );
  }
});
