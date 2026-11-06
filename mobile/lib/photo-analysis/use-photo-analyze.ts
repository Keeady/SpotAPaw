import { AnalysisResponse } from "@/components/analyzer/types";
import { usePetAnalyzer } from "@/components/analyzer/use-pet-image-analyzer";
import { useAIFeatureContext } from "@/components/Provider/ai-context-provider";
import { AuthContext } from "@/components/Provider/auth-provider";
import { createErrorLogMessageAsync } from "@/components/util";
import { PetImage } from "@/components/wizard/wizard-interface";
import { startInstrument } from "@/instrumentation/instrument";
import { useCallback, useContext } from "react";

export default function usePhotoAnalyzeStep() {
  const { user } = useContext(AuthContext);
  const { isAiFeatureEnabled } = useAIFeatureContext();

  const onImageAnalyzeSuccess = useCallback(
    (
      data?: AnalysisResponse,
      publicUrl?: string,
      petDescriptionId?: string,
      publicUrls?: string[],
    ) => {
      const response = {
        publicUrl,
        publicUrls,
        petDescriptionId,
        pets: data && "pets" in data && data.pets.length > 0 ? data.pets : [],
        aiNote: data && "note" in data && data.note ? data.note : "",
      };

      if (response.aiNote.toLowerCase().includes("no pets detected")) {
        throw new Error(response.aiNote, { cause: "NO_PETS_DETECTED" });
      }
      return response;
    },
    [],
  );

  const { analyzeMultiple } = usePetAnalyzer({
    onSuccess: onImageAnalyzeSuccess,
  });

  return useCallback(
    async (images?: PetImage[]) => {
      if (!isAiFeatureEnabled || !images || images.length === 0) {
        return;
      }

      const instrument = startInstrument({
        eventName: "analyze_photos_event",
        eventData: {
          is_ai_enabled: true,
          total_count: images.length,
          user_type: user?.id ? "authenticated" : "anonymous",
        },
      });

      return analyzeMultiple(images)
        .then(() => {
          instrument.success({
            status: "success",
          });
        })
        .catch(async (error) => {
          const errorMessage = await createErrorLogMessageAsync(error);
          instrument.failure({
            error_message: errorMessage,
            error_type: "image_analysis_error",
            status: "failed",
          });

          return Promise.reject(error);
        });
    },
    [isAiFeatureEnabled],
  );
}
