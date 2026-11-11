import { AggregatedSighting, Sighting } from "@/db/models/sighting";
import {
  AggregatedSightingResponse,
  BaseSightingRepository,
  SightingFilters,
  SightingRepositoryResponse,
} from "../base-sighting-repository";
import { ApiClient } from "./client";

export class ApiSightingRepository extends BaseSightingRepository {
  apiClient: ApiClient;
  constructor(apiClient: ApiClient) {
    super();
    this.apiClient = apiClient;
  }

  async getSightings(
    filters: SightingFilters,
  ): Promise<SightingRepositoryResponse> {
    if (!this.apiClient) {
      throw new Error("Undefined api client");
    }

    const { latitude, longitude } = filters;

    const response = await this.apiClient.get<AggregatedSighting[]>(
      `/aggregated-sightings?latitude=${latitude}&longitude=${longitude}`,
    );

    return {
      data: response,
      count: response.length,
    };
  }

  async getAggregatedSightingById(
    aggregatedSightingId: string,
    linkedSightingId: string,
  ): Promise<AggregatedSightingResponse> {
    if (!this.apiClient) {
      throw new Error("Undefined api client");
    }

    const response = await this.apiClient.get<AggregatedSightingResponse>(
      `/aggregated-sightings/${aggregatedSightingId}?linked_sighting_id=${linkedSightingId}`,
    );

    return {
      summary: response.summary,
      sightings: response.sightings,
    };
  }

  async getSighting(aggregatedSightingId: string): Promise<AggregatedSighting> {
    if (!this.apiClient) {
      throw new Error("Undefined api client");
    }

    const response = await this.apiClient.get<AggregatedSightingResponse>(
      `/aggregated-sightings/${aggregatedSightingId}`,
    );

    return response.summary;
  }

  async getSightingByLinkedSightingId(
    linkedSightingId: string,
  ): Promise<AggregatedSighting> {
    if (!this.apiClient) {
      throw new Error("Undefined api client");
    }

    const response = await this.apiClient.get<AggregatedSighting>(
      `/aggregated-sightings/my/${linkedSightingId}`,
    );

    return response;
  }

  async updateSighting(
    id: string,
    payload: Partial<AggregatedSighting>,
  ): Promise<void> {
    if (!this.apiClient) {
      throw new Error("Undefined api client");
    }

    await this.apiClient.patch<AggregatedSighting>(
      `/aggregated-sightings/my/${id}`,
      {
        ...payload
      }
    );
  }

  async createSighting(payload: Partial<Sighting>): Promise<string> {
    if (!this.apiClient) {
      throw new Error("Undefined api client");
    }

   return this.apiClient.post<AggregatedSighting>(
      `/aggregated-sightings`,
      {
        ...payload
      }
    );
  }

  async getSightingsByReporter(
    reporterId: string,
  ): Promise<AggregatedSighting[]> {
     if (!this.apiClient) {
      throw new Error("Undefined api client");
    }

    return this.apiClient.get(`sightings/my`);
  }

  async getMatchingSightings(
    id: string,
    petDescriptionId: string,
  ): Promise<AggregatedSighting[]> {
    if (!this.apiClient) {
      throw new Error("Undefined api client");
    }

    return this.apiClient.get(`/matches?aggregated-sighting-id=${id}`);
  }
}
