import "react-native-get-random-values";
import { useCallback, useContext } from "react";
import { v4 as uuidv4 } from "uuid";
import { AuthContext } from "./Provider/auth-provider";
import { supabase } from "./supabase-client";
import AppConstant from "./constants";
import { log } from "./logs";
import { createErrorLogMessage } from "./util";

export default function useUploadPetImageUrl() {
  const SUPABASE_URL = AppConstant.EXPO_PUBLIC_SUPABASE_URL;
  const SUPABASE_KEY = AppConstant.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  const BUCKET = "pet_photos";
  const { session } = useContext(AuthContext);

  return useCallback(
    async (uri: string, callback: (uri: string, error?: string) => void) => {
      if (!uri) return;

      try {
        const response = await fetch(uri);
        const blob = await response.blob();
        const filePath = `sightings/${uuidv4()}.jpg`;

        const xhr = new XMLHttpRequest();
        xhr.open(
          "POST",
          `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${filePath}`,
        );

        xhr.setRequestHeader("apikey", SUPABASE_KEY);
        xhr.setRequestHeader(
          "Authorization",
          `Bearer ${session?.access_token ?? SUPABASE_KEY}`,
        );
        xhr.setRequestHeader("Content-Type", "image/jpg");

        xhr.onload = () => {
          if (xhr.status === 200) {
            // Get a public URL back
            const { data } = supabase.storage
              .from("pet_photos")
              .getPublicUrl(filePath);
            if (data.publicUrl) {
              callback(data.publicUrl);
            }
          } else {
            log(`Upload error ${xhr.responseText}`);
          }
        };

        xhr.onerror = () => {
          log(`Upload failed ${xhr.responseText}`);
          callback("", "Error saving photo");
        };

        xhr.send(blob);
      } catch (e) {
        callback("", `Error saving photo ${e}`);
        const errorMessage = createErrorLogMessage(e);
        log(`Error saving photo ${errorMessage}`);
      }
    },
    [SUPABASE_KEY, SUPABASE_URL, session?.access_token],
  );
}

async function readImageAsBase64(uri: string): Promise<string> {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    throw new Error(`Failed to read image: ${error}`);
  }
}

export const uploadPhotoWithProcessing = async (
  uri: string,
  prompt: string,
) => {
  try {
    const base64Image = await readImageAsBase64(uri);

    const { data, error } = await supabase.functions.invoke(
      "upload-photo-with-ai-processing",
      {
        body: {
          photo: base64Image,
          filename: `photo-${uuidv4()}.jpg`,
          prompt,
          filetype: "image/jpeg",
        },
      },
    );

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    throw error;
  }
};
