import { supabase } from "@/components/supabase-client";
import { AggregatedSighting, Sighting } from "../models/sighting";
import {
  AggregatedSightingResponse,
  ISightingRepository,
  SightingFilters,
} from "./base-sighting-repository";
import { ApiSightingRepository, SupabaseSightingRepository } from "./api/sighting-repository";
import { ApiClient, authenticatedApiClient, publicApiClient } from "./api/client";

export class SightingRepository implements ISightingRepository {
  getAggregatedSightingById(
      aggregatedSightingId: string,
      linkedSightingId: string,
    ): Promise<AggregatedSightingResponse> {
      const repository = new ApiSightingRepository(publicApiClient);
      return repository.getAggregatedSightingById(aggregatedSightingId, linkedSightingId)
    }

  findMatchingSightings(
    sightingId: string,
    userLocationLat: number,
    userLocationLong: number,
    sightingRadiusKm: number,
  ): Promise<void> {
    const repository = new SupabaseSightingRepository(supabase);
    return repository.findMatchingSightings(
      sightingId,
      userLocationLat,
      userLocationLong,
      sightingRadiusKm,
    );
  }
  getMatchingSightings(id: string, petDescriptionId: string): Promise<AggregatedSighting[]> {
    const repository = new SupabaseSightingRepository(supabase);
    return repository.getMatchingSightings(id, petDescriptionId);
  }
  getSightingsByReporter(reporterId: string): Promise<AggregatedSighting[]> {
    const repository = new SupabaseSightingRepository(supabase);
    return repository.getSightingsByReporter(reporterId);
  }
  updateSightingStatusByPet(id: string): Promise<void> {
    const repository = new ApiSightingRepository(authenticatedApiClient);
    return repository.updateSightingStatusByPet(id);
  }
  getLinkedSightings(id: string): Promise<AggregatedSighting[]> {
    const repository = new SupabaseSightingRepository(supabase);
    return repository.getLinkedSightings(id);
  }
  getSighting(id: string): Promise<AggregatedSighting> {
    const repository = new SupabaseSightingRepository(supabase);
    return repository.getSighting(id);
  }
  getSightingByLinkedSightingId(linkedSightingId: string): Promise<AggregatedSighting> {
    const repository = new SupabaseSightingRepository(supabase);
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
