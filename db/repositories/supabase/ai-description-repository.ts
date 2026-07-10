import { AiDescription } from "@/db/models/aiDescription";
import { SupabaseClient } from "@supabase/supabase-js";
import { IAiDescriptionRepository } from "../base-ai-description-repository";

export class SupabaseAiDescriptionRepository implements IAiDescriptionRepository {
  supabaseClient: SupabaseClient;
  constructor(supabase: SupabaseClient) {
    this.supabaseClient = supabase;
  }

  async getAiDescription(id: string): Promise<AiDescription | null> {
    if (!this.supabaseClient) {
      throw new Error("Undefined supabase client");
    }

    const { data, error } = await this.supabaseClient
      .from("pet_desc_results")
      .select("*")
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
        throw new Error(`No AI description found for id: ${id}`);
    }

    return data[0];
  }
}
