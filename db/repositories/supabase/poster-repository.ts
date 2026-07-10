import { Poster } from "@/db/models/poster";
import { IPosterRepository } from "../base-poster-repository";
import { SupabaseClient } from "@supabase/supabase-js";

export class SupabasePosterRepository implements IPosterRepository {
  supabaseClient: SupabaseClient;
  constructor(supabase: SupabaseClient) {
    this.supabaseClient = supabase;
  }

  async generatePosterForSighting(sightingId: string, isAiFeatureEnabled: boolean): Promise<Poster | null> {
    if (!this.supabaseClient) {
      throw new Error("Undefined supabase client");
    }

    const { data, error } = await this.supabaseClient.functions.invoke(
      "generate-poster-for-sighting",
      {
        body: {
          sightingId,
          isAiFeatureEnabled,
        },
      },
    );

    if (error) {
      throw error;
    }

    if (!data) {
      return null;
    }

    return data as Poster;
  }

  async getPoster(posterId: string): Promise<Poster | null> {
    if (!this.supabaseClient) {
      throw new Error("Undefined supabase client");
    }

    const { data, error } = await this.supabaseClient
      .from("posters")
      .select("*")
      .eq("id", posterId);

    if (error) {
      console.error("Failed to fetch poster:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      return null;
    }

    return data[0] as Poster;
  }
}
