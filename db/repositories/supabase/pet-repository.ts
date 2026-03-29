import { Pet } from "@/db/models/pet";
import { BasePetRepository } from "../base-pet-repository";
import { SupabaseClient } from "@supabase/supabase-js";

export class SupabasePetRepository extends BasePetRepository {
  supabaseClient: SupabaseClient | undefined;
  constructor(supabase: SupabaseClient) {
    super();
    this.supabaseClient = supabase;
  }

  async getPet(id: string): Promise<Pet> {
    if (!this.supabaseClient) {
      throw new Error("Undefined supabase client");
    }

    const { error, data } = await this.supabaseClient
      .from("pets")
      .select("*")
      .eq("id", id);

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      throw new Error("No pet returned");
    }

    return this.denormalizePayload(data[0]);
  }

  async getPets(ownerId: string): Promise<Pet[]> {
    if (!this.supabaseClient) {
      throw new Error("Undefined supabase client");
    }

    const { error, data } = await this.supabaseClient
      .from("pets")
      .select("*")
      .eq("owner_id", ownerId);

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((d) => this.denormalizePayload(d));
  }

  async createPet(pet: Partial<Pet>): Promise<string> {
    if (!this.supabaseClient) {
      throw new Error("Undefined supabase client");
    }

    const normalizedPet = this.normalizePayload(pet);
    const { error, data } = await this.supabaseClient
      .from("pets")
      .insert(normalizedPet)
      .select("id")
      .single();

    if (error) {
      throw error;
    }

    if (!data || !data.id) {
      throw new Error("No pet returned");
    }

    const id = data.id;

    return id;
  }

  async deletePet(id: string, ownerId: string): Promise<void> {
    if (!this.supabaseClient) {
      throw new Error("Undefined supabase client");
    }
    const { error } = await this.supabaseClient
      .from("pets")
      .delete()
      .eq("id", id)
      .eq("owner_id", ownerId);

    if (error) {
      throw error;
    }
  }

  async updatePet(id: string, payload: Partial<Pet>): Promise<void> {
    if (!this.supabaseClient) {
      throw new Error("Undefined supabase client");
    }
    const normalizedPayload = this.normalizePayload(payload);    
    const { error } = await this.supabaseClient
      .from("pets")
      .update(normalizedPayload)
      .eq("id", id);

    if (error) {
      throw error;
    }
  }

  protected normalizePayload(payload: Partial<Pet>) {
    type keyOfPet = keyof Pet;
    type DBKey = {
      [key in keyof Pet]: string;
    };
    const dbKeys: DBKey = {
      ownerId: "owner_id",
      name: "name",
      species: "species",
      breed: "breed",
      gender: "gender",
      age: "age",
      colors: "colors",
      features: "features",
      isLost: "is_lost",
      note: "note",
      photo: "photo",
      id: "id",
      lastSeenLat: "last_seen_lat",
      lastSeenLocation: "last_seen_location",
      lastSeenLong: "last_seen_long",
      createdAt: "created_at",
      lastSeenTime: "last_seen_time",
    };

    const normalizedPayload = {};

    Object.keys(payload).map((key) => {
      const dbKey = key in dbKeys && dbKeys[key as keyOfPet];
      if (dbKey) {
        normalizedPayload[dbKey] = payload[key as keyOfPet];
      }
    });

    return normalizedPayload;
  }

  protected denormalizePayload(payload: any): Pet {
    type keyOfPet = keyof Pet;
    type DBKey = {
      [key in keyof Pet]: string;
    };
    const dbKeys: DBKey = {
      ownerId: "owner_id",
      name: "name",
      species: "species",
      breed: "breed",
      gender: "gender",
      age: "age",
      colors: "colors",
      features: "features",
      isLost: "is_lost",
      note: "note",
      photo: "photo",
      id: "id",
      lastSeenLat: "last_seen_lat",
      lastSeenLocation: "last_seen_location",
      lastSeenLong: "last_seen_long",
      createdAt: "created_at",
      lastSeenTime: "last_seen_time",
    };

    const deNormalizedPayload = {} as Pet;

    Object.keys(dbKeys).map((key) => {
      const dbKey = dbKeys[key as keyOfPet];
      const dbValue = dbKey in payload && payload[dbKey as keyOfPet];
      if (dbValue !== undefined) {
        deNormalizedPayload[key] = dbValue;
      }
    });

    return deNormalizedPayload;
  }
}
