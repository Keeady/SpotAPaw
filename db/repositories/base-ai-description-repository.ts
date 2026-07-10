import { AiDescription } from "../models/aiDescription";

export interface IAiDescriptionRepository {
    getAiDescription(id: string): Promise<AiDescription | null>;
}