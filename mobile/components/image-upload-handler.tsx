import "react-native-get-random-values";
import { useCallback } from "react";
import { supabase } from "./supabase-client";
import { MAX_FILE_SIZE_ERROR, UNSUPPORTED_MIME_TYPE } from "./constants";
import * as Crypto from "expo-crypto";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/heic"];

async function readImageAsBase64(uri: string): Promise<string> {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();

    if (blob.size > MAX_FILE_SIZE) {
      throw new Error(`File exceeds max size: ${blob.size} bytes`, {
        cause: MAX_FILE_SIZE_ERROR,
      });
    }

    if (!ALLOWED_TYPES.includes(blob.type)) {
      throw new Error(`Unsupported file type: ${blob.type}`, {
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
          filename: image.filename,
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
      throw error;
    }

    return data;
  } catch (error) {
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
              filename: image.filename,
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
          throw error;
        }

        if (!data || !data.publicUrls) {
          callback([], "No public URLs returned from upload");
          return;
        }

        callback(data.publicUrls);
      } catch (error) {
        throw error;
      }
    },
    [],
  );

  return { uploadMultiplePetImages };
}
