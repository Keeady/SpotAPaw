import { useCallback, useState } from "react";
import {
  uploadMultiplePhotosWithProcessing,
  uploadPhotoWithProcessing,
} from "../image-upload-handler";
import type { AnalysisResponse } from "./types";

interface UsePetAnalyzerOptions {
  onSuccess?: (
    result?: AnalysisResponse,
    publicUrl?: string,
    petDescriptionId?: string,
    publicUrls?: string[],
  ) => void;
}

interface UsePetAnalyzerReturn {
  analyze: (uri: string, filename: string, filetype: string) => Promise<void>;
  analyzeMultiple: (
    images: { uri: string; filename: string; filetype: string }[],
  ) => Promise<void>;
  loading: boolean;
}

export function usePetAnalyzer(
  options: UsePetAnalyzerOptions,
): UsePetAnalyzerReturn {
  const [loading, setLoading] = useState(false);

  const { onSuccess } = options;

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

  const analyze = useCallback(
    async (uri: string, filename: string, filetype: string) => {
      try {
        if (!uri || !filename || !filetype) {
          throw new Error(
            "Missing required parameters uri or filename or filetype.",
          );
        }

        setLoading(true);
        const response = await uploadPhotoWithProcessing(
          uri,
          filename,
          filetype,
        );

        if (!response) {
          throw new Error("Failed with no response");
        }

        const { result, publicUrl, petDescriptionId } = response;

        if (result) {
          const data = parseJsonResponse(result);
          onSuccess?.(data, publicUrl, petDescriptionId);
          return;
        }

        if (publicUrl) {
          onSuccess?.(undefined, publicUrl, petDescriptionId);
          return;
        }

        if (petDescriptionId) {
          onSuccess?.(undefined, undefined, petDescriptionId);
        }
      } catch (error) {
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [onSuccess],
  );

  const analyzeMultiple = useCallback(
    async (images: { uri: string; filename: string; filetype: string }[]) => {
      try {
        let hasError = false;
        images.forEach(({ uri, filename, filetype }) => {
          if (!uri || !filename || !filetype) {
            hasError = true;
            return;
          }
        });

        if (hasError) {
          throw new Error(
            "Missing required parameters uri or filename or filetype.",
          );
        }
        setLoading(true);
        const response = await uploadMultiplePhotosWithProcessing(images);

        if (!response) {
          throw new Error("Failed with no response");
        }

        const { result, publicUrls, petDescriptionId } = response;

        if (result) {
          const data = parseJsonResponse(result);
          onSuccess?.(data, undefined, petDescriptionId, publicUrls);
          return;
        }

        if (petDescriptionId) {
          onSuccess?.(undefined, undefined, petDescriptionId, publicUrls);
          return;
        }

        if (publicUrls) {
          onSuccess?.(undefined, undefined, undefined, publicUrls);
        }
      } catch (error) {
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [onSuccess],
  );

  return {
    analyze,
    analyzeMultiple,
    loading,
  };
}
