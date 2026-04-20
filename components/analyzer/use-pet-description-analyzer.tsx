import { useCallback, useState } from "react";
import { uploadPhotoWithProcessing } from "../image-upload-handler";
import type { AnalysisResponse } from "./types";
import { PetRepository } from "@/db/repositories/pet-repository";

interface UsePetDescriptionAnalyzerOptions {
  onSuccess?: (success: boolean) => void;
}

interface UsePetDescriptionAnalyzerReturn {
  analyze: (petDescriptionId: string) => Promise<void>;
  loading: boolean;
}

export function usePetDescriptionAnalyzer(
  options: UsePetDescriptionAnalyzerOptions,
): UsePetDescriptionAnalyzerReturn {
  const [loading, setLoading] = useState(false);

  const { onSuccess } = options;

  const analyze = useCallback(
    async (petDescriptionId: string) => {
      try {
        if (!petDescriptionId) {
          throw new Error("Missing required parameter petDescriptionId.");
        }

        setLoading(true);
        const petRepository = new PetRepository();
        await petRepository.processPetDescription(petDescriptionId);

        if (onSuccess) {
          onSuccess(true);
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
    loading,
  };
}
