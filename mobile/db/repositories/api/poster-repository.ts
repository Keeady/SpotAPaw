import { Poster } from "@/db/models/poster";
import { IPosterRepository } from "../base-poster-repository";
import { ApiClient } from "./client";

export class ApiPosterRepository implements IPosterRepository {
  apiClient: ApiClient;
  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getPoster(
    posterId: string,
    sightingId?: string,
  ): Promise<Poster | null> {
    if (!this.apiClient) {
      throw new Error("Undefined api client");
    }

    return this.apiClient.get<Poster>(
      `/posters?posterId=${posterId}&sightingId=${sightingId}`,
    );
  }

  async updatePoster(posterId: string, data: Partial<Poster>) {
    if (!this.apiClient) {
      throw new Error("Undefined api client");
    }

    this.apiClient.patch<Poster>(`/posters/${posterId}`, {
      description: data.description,
      cta: data.cta,
      contactName: data.contact_name,
      contactPhone: data.contact_phone,
    });
  }
}
