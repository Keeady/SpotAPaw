import { Poster } from "@/db/models/poster";
import { IPosterRepository } from "../base-poster-repository";
import { SupabaseClient } from "@supabase/supabase-js";

export class SupabasePosterRepository implements IPosterRepository {
  supabaseClient: SupabaseClient;
  constructor(supabase: SupabaseClient) {
    this.supabaseClient = supabase;
  }

  async generatePosterForSighting(
    sightingId: string,
    isAiFeatureEnabled: boolean,
  ): Promise<Poster | null> {
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

  async getPoster(posterId: string, sightingId?: string): Promise<Poster | null> {
    if (!this.supabaseClient) {
      throw new Error("Undefined supabase client");
    }

    return Promise.resolve({
      id: "1",
      sighting_id: "02e383fb-5e54-4129-be7d-8f7bf6f4cefd",
      headline: "LOST DOG",
      subheadline: "Please help us bring our beloved dog home safely.",
      photo_url:"https://tdrhuucwalyoftbzwojm.supabase.co/storage/v1/object/public/pet_photos/ai_sightings/8301c32611a12444e9bc1b559fd7747a927cd6ca8f273771a85f5a899558bda6.jpeg",
      last_seen_location: "N Blaney Ave, Cupertino",
      last_seen_time: "Oct 19 2026",
      description:
        "Louis is a large male German Shepherd mix, identifiable by his striking pointed ears and dark eyes. He might be scared or shy if approached, but he's a very sweet boy who is deeply missed.",
      cta: "If you see Louis, please do not approach him directly if he seems scared, but call or text us immediately.",
      colors: "black, tan, brown",
      breed: "German Shepherd mix",
      name: "Louis",
      poster_url: "",
      contact_name: "Mama",
      contact_phone: "555-555-5555",
      pdf_url: "",
      png_url: "",
      html_url: "",
      created_at: ""
    });

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

  async updatePoster(posterId: string, data: Partial<Poster>) {
    if (!this.supabaseClient) {
      throw new Error("Undefined supabase client");
    }

    const { error } = await this.supabaseClient
      .from("posters")
      .update(data)
      .eq("id", posterId);

    if (error) {
      console.error("Failed to fetch poster:", error);
      throw error;
    }
  }
}
