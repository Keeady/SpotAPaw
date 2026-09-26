import { Poster } from "../models/poster";

export interface IPosterRepository {
    generatePosterForSighting(sightingId: string, isAiFeatureEnabled: boolean): Promise<Poster | null>;
    getPoster(posterId: string): Promise<Poster | null>;
}