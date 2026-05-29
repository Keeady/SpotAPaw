import "react-native-get-random-values";
import { useCallback, useContext } from "react";
import { v4 as uuidv4 } from "uuid";
import { AuthContext } from "./Provider/auth-provider";
import { supabase } from "./supabase-client";
import AppConstant, {
  MAX_FILE_SIZE_ERROR,
  UNSUPPORTED_MIME_TYPE,
} from "./constants";
import { log } from "./logs";
import { createErrorLogMessage, createErrorLogMessageAsync } from "./util";
import * as Crypto from "expo-crypto";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png"];

export function useUploadPetImageUrl() {
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
        const errorMessage = createErrorLogMessage(e);
        callback("", `Error saving photo ${errorMessage}`);
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

    if (blob.size > MAX_FILE_SIZE) {
      throw new Error("File exceeds max size", {
        cause: MAX_FILE_SIZE_ERROR,
      });
    }

    if (!ALLOWED_TYPES.includes(blob.type)) {
      throw new Error("Unsupported file type", {
        cause: UNSUPPORTED_MIME_TYPE,
      });
    }
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    throw error;
  }
}

async function getFileHash(base64String: string): Promise<string> {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    base64String,
  );
}

export const uploadPhotoWithProcessing = async (
  uri: string,
  filename: string,
  filetype: string,
) => {
  try {
    const base64Image = await readImageAsBase64(uri);
    const imageHash = await getFileHash(base64Image);

    const { data, error } = await supabase.functions.invoke(
      "upload-photo-with-ai-processing",
      {
        body: {
          photo: base64Image,
          filename,
          filetype,
          hash: imageHash,
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

export const uploadMultiplePhotosWithProcessing = async (
  images: { uri: string; filename: string; filetype: string }[],
) => {
  try {
    const processedImages = await Promise.all(
      images.map(async (image) => {
        const base64Image = await readImageAsBase64(image.uri);
        const imageHash = await getFileHash(base64Image);
        return {
          photo: base64Image,
          filename: imageHash + "." + image.filetype.split("/")[1],
          filetype: image.filetype,
          hash: imageHash,
        };
      }),
    );

    const { data, error } = await supabase.functions.invoke(
      "upload-multiple-photos-with-ai-processing",
      {
        body: {
          images: processedImages,
        },
      },
    );

    if (error) {
      const errorMessage = await createErrorLogMessageAsync(error);
      log(`Error invoking upload-multiple-photos-with-ai-processing function: ${errorMessage}`);
      throw error;
    }

    return data;
  } catch (error) {
    const errorMessage = await createErrorLogMessageAsync(error);
    log(`Error uploading multiple photos: ${errorMessage}`);
    throw error;
  }
};

export function useUploadMultiplePetImage() {
  const uploadMultiplePetImages = useCallback(
    async (
      images: { uri: string; filename: string; filetype: string }[],
      callback: (uri: string[], error?: string) => void,
    ) => {
      try {
        const processedImages = await Promise.all(
          images.map(async (image) => {
            const base64Image = await readImageAsBase64(image.uri);
            const imageHash = await getFileHash(base64Image);
            return {
              photo: base64Image,
              filename: imageHash + "." + image.filetype.split("/")[1],
              filetype: image.filetype,
              hash: imageHash,
            };
          }),
        );

        const { data, error } = await supabase.functions.invoke(
          "upload-multiple-photos",
          {
            body: {
              images: processedImages,
            },
          },
        );

        if (error) {
          const errorMessage = await createErrorLogMessageAsync(error);
          log(`Error invoking upload-multiple-photos function: ${errorMessage}`);
          throw error;
        }

        if (!data || !data.publicUrls) {
          callback([], "No public URLs returned from upload");
          return;
        }

        callback(data.publicUrls);
      } catch (error) {
        const errorMessage = await createErrorLogMessageAsync(error);
        log(`Error uploading photos: ${errorMessage}`);
        callback([], `Error uploading photos ${errorMessage}`);
      }
    },
    [],
  );

  return { uploadMultiplePetImages };
}
