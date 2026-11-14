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

    const { latitude, longitude, radius } = filters;

    const response = await this.apiClient.get<AggregatedSighting[]>(
      `/aggregated-sightings?latitude=${latitude}&longitude=${longitude}&radius=${radius}`,
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
      `/aggregated-sightings/${aggregatedSightingId}/details?linkedSightingId=${linkedSightingId}`,
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

    const response = await this.apiClient.get<AggregatedSighting>(
      `/aggregated-sightings/${aggregatedSightingId}`,
    );

    if ("summary" in response && response["summary"]) {
      return response.summary as AggregatedSighting;
    }

    return response;
  }

  async getSightingByLinkedSightingId(
    linkedSightingId: string,
  ): Promise<AggregatedSighting> {
    if (!this.apiClient) {
      throw new Error("Undefined api client");
    }

    const response = await this.apiClient.get<AggregatedSighting>(
      `/aggregated-sightings/my?linkedSightingId=${linkedSightingId}`,
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

    const changes = {
      name: payload.name,
      petId: payload.petId,
      lastSeenLat: payload.lastSeenLat,
      lastSeenLong: payload.lastSeenLong,
      lastSeenLocation: payload.lastSeenLocation,
      lastSeenTime: payload.lastSeenTime,
      note: payload.note,
      gender: payload.gender,
      colors: payload.colors,
      breed: payload.breed,
      species: payload.species,
      features: payload.features,
      linkedSightingId: payload.linkedSightingId,
      reporterName: payload.reporterName,
      reporterPhone: payload.reporterPhone,
      size: payload.size,
      collarDescription: payload.collarDescription,
      age: payload.age ?? 0,
      behavior: payload.behavior,
    } as Partial<AggregatedSighting>;

    if (payload.photos && payload.photos.length > 0) {
      changes.photos = payload.photos;
    }

    if (payload.petDescriptionId) {
      changes.petDescriptionId = payload.petDescriptionId;
    }

    await this.apiClient.patch<AggregatedSighting>(
      `/aggregated-sightings/my/${id}`,
      {
        ...changes,
        petId: payload.id,
      },
    );
  }

  async createSighting(payload: Partial<Sighting>): Promise<string> {
    if (!this.apiClient) {
      throw new Error("Undefined api client");
    }

    const data = {
      name: payload.name,
      petId: payload.petId,
      lastSeenLat: payload.lastSeenLat,
      lastSeenLong: payload.lastSeenLong,
      lastSeenLocation: payload.lastSeenLocation,
      lastSeenTime: payload.lastSeenTime,
      note: payload.note,
      gender: payload.gender,
      colors: payload.colors,
      breed: payload.breed,
      species: payload.species,
      features: payload.features,
      linkedSightingId: payload.linkedSightingId,
      isActive: true,
      reporterName: payload.reporterName,
      reporterPhone: payload.reporterPhone,
      size: payload.size,
      collarDescription: payload.collarDescription,
      age: payload.age ?? 0,
      photos: payload.photos,
      behavior: payload.behavior,
    } as Partial<AggregatedSighting>;

    if (payload.petDescriptionId) {
      data.petDescriptionId = payload.petDescriptionId;
    }

    return this.apiClient.post<AggregatedSighting>(`/sightings`, data);
  }

  async getSightingsByReporter(
    reporterId: string,
  ): Promise<Sighting[]> {
    if (!this.apiClient) {
      throw new Error("Undefined api client");
    }

    return this.apiClient.get(`sightings/my`);
  }

  async getMatchingSightings(id: string): Promise<AggregatedSighting[]> {
    if (!this.apiClient) {
      throw new Error("Undefined api client");
    }

    return this.apiClient.get(`/sighting-matches/?sightingId=${id}`);
  }

  async updateSightingStatusByPet(petId: string): Promise<void> {
    if (!this.apiClient) {
      throw new Error("Undefined api client");
    }

    await this.apiClient.patch<AggregatedSighting>(
      `/aggregated-sightings/status?petId=${petId}`,
      {
        isActive: false,
      },
    );
  }

  async getSightingsByPetId(petId: string): Promise<AggregatedSighting[]> {
    if (!this.apiClient) {
      throw new Error("Undefined api client");
    }

    const response = await this.apiClient.get<AggregatedSighting[]>(
      `/aggregated-sightings/pets/${petId}`,
    );

    return response;
  }
}
