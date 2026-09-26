import { supabase } from "@/components/supabase-client";
import { Poster } from "../models/poster";
import { IPosterRepository } from "./base-poster-repository";
import { SupabasePosterRepository } from "./supabase/poster-repository";

export class PosterRepository implements IPosterRepository {
  generatePosterForSighting(sightingId: string, isAiFeatureEnabled: boolean): Promise<Poster | null> {
    const repository = new SupabasePosterRepository(supabase);
    return repository.generatePosterForSighting(sightingId, isAiFeatureEnabled);
  }
  getPoster(posterId: string): Promise<Poster | null> {
    const repository = new SupabasePosterRepository(supabase);
    return repository.getPoster(posterId);
  }
}
