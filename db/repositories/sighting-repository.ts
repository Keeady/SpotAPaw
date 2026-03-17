import { supabase } from "@/components/supabase-client";
import { ISightingRepository, SightingFilters } from "./base-sighting-repository";
import { SupabaseSightingRepository } from "./supabase/sighting-repository";
import { AggregatedSighting, Sighting } from "../models/sighting";

export class SightingRepository implements ISightingRepository {
  getSighting(id: string): Promise<AggregatedSighting> {
    throw new Error("Method not implemented.");
  }
  createSighting(data: Sighting): Promise<string> {
    throw new Error("Method not implemented.");
  }
  updateSighting(id: string, data: AggregatedSighting): Promise<void> {
    throw new Error("Method not implemented.");
  }
  getSightings(filters: SightingFilters) {
    const repository = new SupabaseSightingRepository(supabase);
    return repository.getSightings(filters);
  }
}