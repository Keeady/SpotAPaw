import { Claim } from "@/db/models/claim";
import { BaseClaimRepository } from "../base-claim-repository";
import { SupabaseClient } from "@supabase/supabase-js";

export class SupabaseClaimRepository extends BaseClaimRepository {
  supabaseClient: SupabaseClient | undefined;
  constructor(supabase: SupabaseClient) {
    super();
    this.supabaseClient = supabase;
  }

  async getClaims(sightingId: string): Promise<Claim[]> {
    if (!this.supabaseClient) {
      throw new Error("Undefined supabase client");
    }
    const { error, data } = await this.supabaseClient
      .from("pet_claims")
      .select("*")
      .eq("sighting_id", sightingId);
    if (error) {
      throw error;
    }

    return data;
  }
  async createClaim(payload: Partial<Claim>): Promise<string> {
    if (!this.supabaseClient) {
      throw new Error("Undefined supabase client");
    }
    const { error, data } = await this.supabaseClient
      .from("pet_claims")
      .insert({
        pet_id: payload.petId,
        sighting_id: payload.sightingId,
        owner_id: payload.ownerId,
      })
      .select("id")
      .single();

    if (error) {
      throw error;
    }

    return data["id"];
  }
}
