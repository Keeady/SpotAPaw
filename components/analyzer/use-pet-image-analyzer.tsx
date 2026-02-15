import type { AnalysisResponse } from "./types";
import { uploadPhotoWithProcessing } from "../image-upload";
import { useCallback, useState } from "react";

interface UsePetAnalyzerOptions {
  onSuccess?: (result?: AnalysisResponse, publicUrl?: string) => void;
  onError?: (error: Error) => void;
}

interface UsePetAnalyzerReturn {
  analyze: (photoUrl: string) => Promise<void>;
  loading: boolean;
}

export function usePetAnalyzer(
  options: UsePetAnalyzerOptions,
): UsePetAnalyzerReturn {
  const [loading, setLoading] = useState(false);

  const { onSuccess, onError } = options;

  function createAnalysisPrompt(): string {
    return `Analyze this image and extract detailed information about any pets visible.

For EACH pet in the image, provide the following information in JSON format:
{
  "pets": [
    {
      "species": "dog/cat/bird/rabbit/etc.",
      "breed": "breed identification",
      "colors": ["primary color", "secondary color", "pattern description"],
      "size": "small/medium/large",
      "distinctive_features": ["feature 1", "feature 2", "feature 3"],
      "collar_descriptions": ["description 1", "description 2", "description 3"],
      "confidence": "high/medium/low"
    }
  ],
  "image_quality": "good/fair/poor",
  "number_of_pets": 1
}

Guidelines:
- **Species**: The type of animal (dog, cat, bird, rabbit, hamster, etc.)
- **Breed Identification** (IMPORTANT):
  - Set "breed" to a descriptive format: "[Dominant Breed] mix" or "[Breed 1] [Breed 2] mix"
  - If you can identify 1-2 specific breeds in the mix, name them (e.g., "German Shepherd Husky mix")
  - If you can identify only the dominant breed, use that (e.g., "German Shepherd mix")
  - If completely uncertain, use "Mixed breed" or "unknown"
- **Colors**: List all visible colors and any patterns (e.g., "brindle", "tabby", "spotted", "merle")
- **Size**: 
  - Small: Under 20 lbs (9 kg) for dogs, small cats, small animals
  - Medium: 20-50 lbs (9-23 kg) for dogs, average cats
  - Large: Over 50 lbs (23 kg) for dogs, large cats
- **Distinctive Features**: 
  - Notable characteristics like "floppy ears", "short tail", "blue eyes", "white chest patch", "wrinkled face", "long fur", "pointed ears", etc.
- **Collar, Tag, or Harness**:
  - Describe Collar, tag, or harness found on the pet such as colors, patterns, and extract any visible writings or brandings

If NO pets are visible in the image, return:
{
  "pets": [],
  "note": "No pets detected in image"
}

Respond ONLY with valid JSON. Do not include any other text or markdown formatting.`;
  }

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

  const analyze = useCallback(async (photoUrl: string) => {
    try {
      const prompt = createAnalysisPrompt();
      const response = await uploadPhotoWithProcessing(photoUrl, prompt);

      if (!response) {
        return;
      }

      const { success, result, publicUrl } = response;

      if (success !== true && result && "error" in result) {
        onError?.(result["error"]);
        return;
      }

      if (success === true) {
        const data = parseJsonResponse(result);
        onSuccess?.(data, publicUrl);
        return;
      }

      if (publicUrl) {
        onSuccess?.(undefined, publicUrl);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [onError, onSuccess]);

  return {
    analyze,
    loading,
  };
}
