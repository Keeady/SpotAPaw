import { Pet } from "@/db/models/pet";
import { BasePetRepository } from "../pet-repository";
import { SupabaseClient } from "@supabase/supabase-js";

export class SupabasePetRepository extends BasePetRepository {
  supabaseClient: SupabaseClient | undefined;
  constructor(supabase: SupabaseClient) {
    super();
    this.supabaseClient = supabase;
  }

  async getPets(ownerId: string): Promise<Pet[]> {
    if (!this.supabaseClient) {
      throw "Undefined supabase client";
    }

    const { error, data } = await this.supabaseClient
      .from("pets")
      .select("*")
      .eq("owner_id", ownerId);

    if (error) {
      throw error;
    }

    return data;
  }
}
