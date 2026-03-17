import { SupabaseClient } from "@supabase/supabase-js";
import {
  BaseSightingRepository,
  SightingFilters,
  SightingRepositoryResponse,
} from "../base-sighting-repository";
import { AggregatedSighting } from "@/db/models/sighting";

export class SupabaseSightingRepository extends BaseSightingRepository {
  supabaseClient: SupabaseClient | undefined;
  constructor(supabase: SupabaseClient) {
    super();
    this.supabaseClient = supabase;
  }

  async getSightings(
    filters: SightingFilters,
  ): Promise<SightingRepositoryResponse> {
    if (!this.supabaseClient) {
      throw new Error("Undefined supabase client");
    }

    const { minLat, maxLat, minLng, maxLng, paginationStart, paginationEnd } =
      filters;

    const { error, data, count } = await this.supabaseClient
      .from("aggregated_sightings")
      .select("*", { count: "exact" })
      .eq("is_active", true)
      .gte("last_seen_lat", minLat)
      .lte("last_seen_lat", maxLat)
      .gte("last_seen_long", minLng)
      .lte("last_seen_long", maxLng)
      .order("updated_at", { ascending: false })
      .range(paginationStart, paginationEnd);

    if (error) {
      throw error;
    }

    if (!data) {
      return { data, count };
    }

    const deNormalizedData = data.map((d) => this.denormalizePayload(d));
    return { data: deNormalizedData, count };
  }

  protected normalizePayload(payload: Partial<AggregatedSighting>) {
    type keyOfPet = keyof AggregatedSighting;
    type DBKey = {
      [key in keyof AggregatedSighting]: string;
    };
    const dbKeys: DBKey = {
      id: "id",
      createdAt: "created_at",
      petId: "pet_id",
      lastSeenLat: "last_seen_lat",
      lastSeenLong: "last_seen_long",
      lastSeenLocation: "last_seen_location",
      lastSeenTime: "last_seen_time",
      note: "note",
      photo: "photo",
      gender: "gender",
      colors: "colors",
      breed: "breed",
      species: "species",
      features: "features",
      name: "name",
      linkedSightingId: "linked_sighting_id",
      isActive: "is_active",
      reporterName: "reporter_name",
      reporterPhone: "reporter_phone",
      reporterId: "reporter_id",
      size: "size",
      collarDescription: "collar_description",
      age: "age",
      updatedAt: "updated_at",
      ownerId: "owner_id",
      linkedSightings: "linked_sightings",
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

  protected denormalizePayload(payload: any): AggregatedSighting {
    type keyOfPet = keyof AggregatedSighting;
    type DBKey = {
      [key in keyof AggregatedSighting]: string;
    };
    const dbKeys: DBKey = {
      id: "id",
      createdAt: "created_at",
      petId: "pet_id",
      lastSeenLat: "last_seen_lat",
      lastSeenLong: "last_seen_long",
      lastSeenLocation: "last_seen_location",
      lastSeenTime: "last_seen_time",
      note: "note",
      photo: "photo",
      gender: "gender",
      colors: "colors",
      breed: "breed",
      species: "species",
      features: "features",
      name: "name",
      linkedSightingId: "linked_sighting_id",
      isActive: "is_active",
      reporterName: "reporter_name",
      reporterPhone: "reporter_phone",
      reporterId: "reporter_id",
      size: "size",
      collarDescription: "collar_description",
      age: "age",
      updatedAt: "updated_at",
      ownerId: "owner_id",
      linkedSightings: "linked_sightings",
    };

    const deNormalizedPayload = {} as AggregatedSighting;

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
