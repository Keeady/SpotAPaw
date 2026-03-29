import { SupabaseClient } from "@supabase/supabase-js";
import { BaseOwnerRepository } from "../base-owner-repository";
import { Owner } from "@/db/models/owner";

export class SupabaseOwnerRepository extends BaseOwnerRepository {
  supabaseClient: SupabaseClient | undefined;
  constructor(supabase: SupabaseClient) {
    super();
    this.supabaseClient = supabase;
  }

  async getOwner(userId: string): Promise<Owner> {
    if (!this.supabaseClient) {
      throw new Error("Undefined supabase client");
    }
    const { error, data } = await this.supabaseClient
      .from("owner")
      .select("*")
      .eq("owner_id", userId);

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      throw new Error("No owner returned");
    }

    return this.denormalizePayload(data[0]);
  }

  async createOwner(payload: Partial<Owner>): Promise<string> {
    if (!this.supabaseClient) {
      throw new Error("Undefined supabase client");
    }

    const normalizedPayload = this.normalizePayload(payload);
    const { error, data } = await this.supabaseClient
      .from("owner")
      .insert(normalizedPayload)
      .select("id")
      .single();
    if (error) {
      throw error;
    }

    if (!data || !data["id"]) {
      throw new Error("No owner id found.");
    }

    return data["id"];
  }

  async updateOwner(id: string, payload: Partial<Owner>): Promise<void> {
    if (!this.supabaseClient) {
      throw new Error("Undefined supabase client");
    }

    const normalizedPayload = this.normalizePayload(payload);
    const { error } = await this.supabaseClient
      .from("owner")
      .update(normalizedPayload)
      .eq("id", id)
      .single();
    if (error) {
      throw error;
    }
  }

  async deleteOwner(id: string): Promise<void> {
    if (!this.supabaseClient) {
      throw new Error("Undefined supabase client");
    }

    const { error } = await this.supabaseClient
      .from("owner")
      .update({ marked_for_deletion: true })
      .eq("id", id);

    if (error) {
      throw error;
    }
  }

  protected normalizePayload(payload: Partial<Owner>) {
    type keyOfOwner = keyof Owner;
    type DBKey = {
      [key in keyof Owner]: string;
    };
    const dbKeys: DBKey = {
      id: "id",
      firstName: "firstname",
      lastName: "lastname",
      phone: "phone",
      countryCode: "country_code",
      email: "email",
      ownerId: "owner_id",
    };

    const normalizedPayload = {};

    Object.keys(payload).map((key) => {
      const dbKey = key in dbKeys && dbKeys[key as keyOfOwner];
      if (dbKey) {
        normalizedPayload[dbKey] = payload[key as keyOfOwner];
      }
    });

    return normalizedPayload;
  }

  protected denormalizePayload(payload: any): Owner {
    type keyOfOwner = keyof Owner;
    type DBKey = {
      [key in keyof Owner]: string;
    };
    const dbKeys: DBKey = {
      id: "id",
      firstName: "firstname",
      lastName: "lastname",
      phone: "phone",
      countryCode: "country_code",
      email: "email",
      ownerId: "owner_id",
    };

    const deNormalizedPayload = {} as Owner;

    Object.keys(dbKeys).map((key) => {
      const dbKey = dbKeys[key as keyOfOwner];
      const dbValue = dbKey in payload && payload[dbKey as keyOfOwner];
      if (dbValue !== undefined) {
        deNormalizedPayload[key] = dbValue;
      }
    });

    return deNormalizedPayload;
  }
}
