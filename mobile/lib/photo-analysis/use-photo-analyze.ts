import { AnalysisResponse } from "@/components/analyzer/types";
import { usePetAnalyzer } from "@/components/analyzer/use-pet-image-analyzer";
import { useAIFeatureContext } from "@/components/Provider/ai-context-provider";
import { AuthContext } from "@/components/Provider/auth-provider";
import { useProContext } from "@/components/Provider/pro-context-provider";
import { createErrorLogMessageAsync } from "@/components/util";
import { PetImage } from "@/components/wizard/wizard-interface";
import { startInstrument } from "@/instrumentation/instrument";
import { useCallback, useContext } from "react";

export default function usePhotoAnalyzeStep() {
  const { aiPhotoAnalysisAllowed } = useProContext();
  const { user } = useContext(AuthContext);
  const { isAiFeatureEnabled } = useAIFeatureContext();
  console.log("top", isAiFeatureEnabled, aiPhotoAnalysisAllowed);

  const { analyzeMultiple } = usePetAnalyzer({});

  return useCallback(
    async (
      images: PetImage[],
      petId: string | null,
      sightingId: string | null,
    ) => {
      console.log(isAiFeatureEnabled, aiPhotoAnalysisAllowed);
      if (
        !isAiFeatureEnabled ||
        !images ||
        images.length === 0 ||
        !aiPhotoAnalysisAllowed
      ) {
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

      return analyzeMultiple(images, petId, sightingId)
        .then((data) => {
          console.log("d", data);
          instrument.success({
            status: "success",
          });

          return data;
        })
        .catch(async (error) => {
          const errorMessage = await createErrorLogMessageAsync(error);
          console.log("errorMessage", errorMessage);
          instrument.failure({
            error_message: errorMessage,
            error_type: "image_analysis_error",
            status: "failed",
          });

          return Promise.reject("Failed to process images.");
        });
    },
    [isAiFeatureEnabled, aiPhotoAnalysisAllowed],
  );
}
