import type {
  PetAnalysisResult,
  PetAnalysisError,
  AnalysisResponse,
} from "./types";
import { GoogleGenAI } from "@google/genai";

export class PetImageAnalyzer {
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error(
        "API key is required.",
      );
    }
    this.apiKey = apiKey;
  }

  /**
   * Get MIME type from file extension or URI
   */
  private getMimeType(uri: string): string {
    const extension = uri.toLowerCase().split(".").pop() || "";
    const mimeTypes: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
      bmp: "image/bmp",
    };
    return mimeTypes[extension] || "image/jpeg";
  }

  /**
   * Create the analysis prompt for Gemini
   */
  private createAnalysisPrompt(): string {
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
  - Collar, tag, or harness description and extract any writings or brandings

If NO pets are visible in the image, return:
{
  "pets": [],
  "note": "No pets detected in image"
}

Respond ONLY with valid JSON. Do not include any other text or markdown formatting.`;
  }

  /**
   * Read image file and convert to base64
   */
  private async readImageAsBase64(uri: string): Promise<string> {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(",")[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      throw new Error(`Failed to read image: ${error}`);
    }
  }

  /**
   * Parse JSON response, handling markdown code blocks
   */
  private parseJsonResponse(text: string): any {
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

  private async callGenAiApi(imageBase64: string, mimeType: string) {
    const prompt = this.createAnalysisPrompt();
    let result;

    const genAI = new GoogleGenAI({
      apiKey: this.apiKey,
    });

    try {
      result = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            inlineData: {
              mimeType: mimeType,
              data: imageBase64,
            },
          },
          { text: prompt },
        ],
      });

    } catch (error) {
      throw new Error(`Error generating content from model: ${error}`);
    }

    return result;
  }

  async analyzePetImage(imageUri: string): Promise<AnalysisResponse> {
    try {
      // Read and encode image
      const base64Image = await this.readImageAsBase64(imageUri);
      const mimeType = this.getMimeType(imageUri);

      // Call Gemini API
      const response = await this.callGenAiApi(base64Image, mimeType);

      // Extract text from response
      if (
        !response ||
        !response.candidates ||
        response.candidates.length === 0
      ) {
        throw new Error("No response from Gemini API");
      }

      const textResponse = response.candidates[0].content?.parts?.[0].text;
      if (!textResponse) {
        throw new Error("Empty response from Gemini API");
      }

      // Parse JSON response
      const result = this.parseJsonResponse(textResponse);
      console.log(result);

      return result as PetAnalysisResult;
    } catch (error) {
      const errorResult: PetAnalysisError = {
        error: "Failed to analyze image",
        details: error instanceof Error ? error.message : String(error),
      };
      return errorResult;
    }
  }
}
