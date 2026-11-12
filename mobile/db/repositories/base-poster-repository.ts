import { Poster } from "../models/poster";

export interface IPosterRepository {
    getPoster(posterId: string): Promise<Poster | null>;
    updatePoster(posterId: string, data: Partial<Poster>): Promise<void>;
}