import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encodeHex } from "jsr:@std/encoding/hex";

interface imagePayload {
  photo: string;
  filename: string;
  filetype: string;
  hash: string;
}

interface reqPayload {
  images: imagePayload[];
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png"];

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !supabaseKey) {
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

async function getFileHash(base64String: string): Promise<string> {
  const data = new TextEncoder().encode(base64String);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return encodeHex(new Uint8Array(hashBuffer));
}

Deno.serve(async (req: Request) => {
  const { images }: reqPayload = await req.json();

  const photoUris = [];

  if (!images || images.length === 0) {
    const error = "No photos provided";
    return getErrorResponse(error, 400);
  }

  if (images.length > 5) {
    const error = "Too many photos";
    return getErrorResponse(error, 400);
  }

  try {
    for (const image of images) {
      const { photo, filetype, hash } = image;
      if (!photo || !hash) {
        const error = "Missing required parameters";
        return getErrorResponse(error);
      }

      const hashCheck = await getFileHash(photo);
      if (hash != hashCheck) {
        const error = "Hash mismatch";
        return getErrorResponse(error);
      }

      if (filetype && !ALLOWED_TYPES.includes(filetype)) {
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

      if (filetype && mimeFromBase64 !== filetype) {
        const error = "MIME type mismatch";
        return getErrorResponse(error);
      }

      const binaryString = atob(photoData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      if (bytes.length > MAX_FILE_SIZE) {
        const error = "File size exceeds max allowed";
        return getErrorResponse(error, 400, "MAX_FILE_SIZE_ERROR");
      }

      let photoPublicUrl = "";
      const { data } = await supabaseClient
        .from("pet_photos")
        .select("*")
        .eq("photo_hash", hash)
        .single();

      if (data) {
        photoPublicUrl = data.public_url;
      } else {
        const filePath = `ai_sightings/${hash}.${mimeFromBase64.split("/")[1]}`;
        // Upload to Supabase Storage
        const { error } = await supabaseClient.storage
          .from("pet_photos")
          .upload(filePath, bytes, {
            contentType: mimeFromBase64,
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

        // Save photo record to pet_photos table
        const { error: insertPetPhotoError } = await supabaseClient
          .from("pet_photos")
          .insert({
            photo_hash: hash,
            public_url: photoPublicUrl,
          });
        if (insertPetPhotoError) {
          console.error(insertPetPhotoError);
        }
      }

      photoUris.push(photoPublicUrl);
    }
  } catch (error) {
    console.error(error);
    return getErrorResponse("Failed to save or get photos.", 500);
  }

  if (photoUris.length === 0) {
    const error = "No valid photos to process";
    return getErrorResponse(error, 400);
  }

  return new Response(
    JSON.stringify({
      success: true,
      publicUrls: photoUris,
    }),
    {
      headers: { "Content-Type": "application/json" },
      status: 200,
    },
  );
});
