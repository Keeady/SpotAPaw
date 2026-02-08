export type PetSize = "small" | "medium" | "large";
export type ConfidenceLevel = "high" | "medium" | "low";
export type ImageQuality = "good" | "fair" | "poor";

export interface PetInfo {
  species: string;
  breed: string;
  colors: string[];
  size: PetSize;
  distinctive_features: string[];
  confidence: ConfidenceLevel;
}

export interface PetAnalysisResult {
  pets: PetInfo[];
  image_quality: ImageQuality;
  number_of_pets: number;
  note?: string;
}

export interface PetAnalysisError {
  error: string;
  details: string;
  raw_response?: string;
}

export type AnalysisResponse = PetAnalysisResult | PetAnalysisError;
