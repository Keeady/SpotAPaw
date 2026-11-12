import { AggregatedSighting, Sighting } from "../models/sighting";
import {
  AggregatedSightingResponse,
  ISightingRepository,
  SightingFilters,
} from "./base-sighting-repository";
import { ApiSightingRepository } from "./api/sighting-repository";
import { authenticatedApiClient, publicApiClient } from "./api/client";

export class SightingRepository implements ISightingRepository {
  getAggregatedSightingById(
      aggregatedSightingId: string,
      linkedSightingId: string,
    ): Promise<AggregatedSightingResponse> {
      const repository = new ApiSightingRepository(publicApiClient);
      return repository.getAggregatedSightingById(aggregatedSightingId, linkedSightingId)
    }

  getMatchingSightings(id: string): Promise<AggregatedSighting[]> {
    const repository = new ApiSightingRepository(publicApiClient);
    return repository.getMatchingSightings(id);
  }
  getSightingsByReporter(reporterId: string): Promise<AggregatedSighting[]> {
    const repository = new ApiSightingRepository(authenticatedApiClient);
    return repository.getSightingsByReporter(reporterId);
  }
  updateSightingStatusByPet(id: string): Promise<void> {
    const repository = new ApiSightingRepository(authenticatedApiClient);
    return repository.updateSightingStatusByPet(id);
  }

  getSighting(id: string): Promise<AggregatedSighting> {
    const repository = new ApiSightingRepository(publicApiClient);
    return repository.getSighting(id);
  }
  getSightingByLinkedSightingId(linkedSightingId: string): Promise<AggregatedSighting> {
    const repository = new ApiSightingRepository(publicApiClient);
    return repository.getSightingByLinkedSightingId(linkedSightingId);
  }
  createSighting(data: Partial<Sighting>): Promise<string> {
    const repository = new ApiSightingRepository(authenticatedApiClient)
    return repository.createSighting(data);
  }
  updateSighting(id: string, data: Partial<AggregatedSighting>): Promise<void> {
    const repository = new ApiSightingRepository(authenticatedApiClient);
    return repository.updateSighting(id, data);
  }
  getSightings(filters: SightingFilters) {
    const repository = new ApiSightingRepository(publicApiClient)
    return repository.getSightings(filters);
  }

  getSightingsByPetId(petId: string): Promise<AggregatedSighting[]> {
    const repository = new ApiSightingRepository(authenticatedApiClient);
    return repository.getSightingsByPetId(petId);
  }
}
