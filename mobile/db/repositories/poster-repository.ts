import { Poster } from "../models/poster";
import { IPosterRepository } from "./base-poster-repository";
import { ApiPosterRepository } from "./api/poster-repository";
import { authenticatedApiClient, publicApiClient } from "./api/client";

export class PosterRepository implements IPosterRepository {
  getPoster(posterId: string, sightingId?: string): Promise<Poster | null> {
    const repository = new ApiPosterRepository(publicApiClient);
    return repository.getPoster(posterId, sightingId);
  }

  updatePoster(posterId: string, data: Partial<Poster>): Promise<void> {
    const repository = new ApiPosterRepository(authenticatedApiClient);
    return repository.updatePoster(posterId, data);
  }
}
