import { useState, useCallback } from "react";
import { PetImageAnalyzer } from "./pet-image-analyzer";
import type { AnalysisResponse } from "./types";

interface UsePetAnalyzerOptions {
  apiKey: string;
  onSuccess?: (result: AnalysisResponse) => void;
  onError?: (error: Error) => void;
}

interface UsePetAnalyzerReturn {
  analyze: (imageUri: string) => Promise<void>;
  loading: boolean;
  error: Error | null;
  reset: () => void;
}

export function usePetAnalyzer(
  options: UsePetAnalyzerOptions,
): UsePetAnalyzerReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { apiKey, onSuccess, onError } = options;

  const analyze = useCallback(
    async (imageUri: string) => {
      setLoading(true);
      setError(null);

      try {
        const analyzer = new PetImageAnalyzer(apiKey);
        const analysisResult = await analyzer.analyzePetImage(imageUri);

        if ("error" in analysisResult) {
          let err = new Error(analysisResult.error);
          if ("details" in analysisResult) {
            err = new Error(`${analysisResult.error}: ${analysisResult.details}`)
          }
          
          setError(err);
          onError?.(err);
        } else {
          onSuccess?.(analysisResult);
        }
      } catch (err) {
        console.log(err)
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        onError?.(error);
      } finally {
        setLoading(false);
      }
    },
    [apiKey, onSuccess, onError],
  );

  const reset = useCallback(() => {
    setError(null);
    setLoading(false);
  }, []);

  return {
    analyze,
    loading,
    error,
    reset,
  };
}
