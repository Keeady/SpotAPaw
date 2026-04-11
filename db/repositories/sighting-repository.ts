import { supabase } from "@/components/supabase-client";
import { AggregatedSighting, Sighting } from "../models/sighting";
import {
  ISightingRepository,
  SightingFilters,
} from "./base-sighting-repository";
import { SupabaseSightingRepository } from "./supabase/sighting-repository";

export class SightingRepository implements ISightingRepository {
  getMatchingSightings(id: string, petDescriptionId: string): Promise<AggregatedSighting[]> {
    const repository = new SupabaseSightingRepository(supabase);
    return repository.getMatchingSightings(id, petDescriptionId);
  }
  getSightingsByReporter(reporterId: string): Promise<AggregatedSighting[]> {
    const repository = new SupabaseSightingRepository(supabase);
    return repository.getSightingsByReporter(reporterId);
  }
  updateSightingStatusByPet(id: string): Promise<void> {
    const repository = new SupabaseSightingRepository(supabase);
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
    const repository = new SupabaseSightingRepository(supabase);
    return repository.createSighting(data);
  }
  updateSighting(id: string, data: Partial<AggregatedSighting>): Promise<void> {
    const repository = new SupabaseSightingRepository(supabase);
    return repository.updateSighting(id, data);
  }
  getSightings(filters: SightingFilters) {
    const repository = new SupabaseSightingRepository(supabase);
    return repository.getSightings(filters);
  }

  getSightingsByPetId(petId: string): Promise<AggregatedSighting[]> {
    const repository = new SupabaseSightingRepository(supabase);
    return repository.getSightingsByPetId(petId);
  }
}
