import { AggregatedSighting, Sighting } from "@/db/models/sighting";
import { SupabaseClient } from "@supabase/supabase-js";
import {
  BaseSightingRepository,
  SightingFilters,
  SightingRepositoryResponse,
} from "../base-sighting-repository";
import { log } from "@/components/logs";

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

    return Promise.resolve({
      data: [
        {
          photos: [
            "https://tdrhuucwalyoftbzwojm.supabase.co/storage/v1/object/public/pet_photos/ai_sightings/87594fc70db086ce9c8b88a658d8e7ee6681351f37aa2062b4a3f634eafc7ac8.jpeg",
          ],
          name: "Louis",
          species: "Dog",
          lastSeenTime: "2026-10-19T16:00:58.489Z",
          lastSeenLat: 37.3286521167393,
          lastSeenLong: -122.022899799049,
          breed: "German Shepherd mix",
          gender: "Male",
          age: 3,
          colors: "black, tan, black and tan points",
          collarDescription: "black collar,silver buckle,black leash attached",
          lastSeenLocation: "10390 N Blaney Ave, Cupertino, CA",
          features:
            "medium-length fur, fluffy curled tail with lighter tip and underside, tan markings on legs and paws, small white patch on left hip",
          updatedAt: "2026-10-19 04:58:52.077+00",
          ownerId: "e866fe24-0f5a-4045-a8d8-c61bdedc4be2",
          linkedSightingId: "02e383fb-5e54-4129-be7d-8f7bf6f4cefd",
          id: "02e383fb-5e54-4129-be7d-8f7bf6f4cefd",
          petId: "b7f449ab-bc2a-4f23-91ad-8f309bcbdd16",
          createdAt: "2026-10-18 05:02:28.797588+00",
          note: "",
          photo: "",
          isActive: true,
          reporterId: "",
          reporterName: "Emma",
          reporterPhone: "2039194426",
          size: "large",
          petDescriptionId: "",
          linkedSightings: [],
          posterId: 1
        },
      ],
      count: 1,
    });

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

    if (!data || data.length === 0) {
      return { data: [], count: 0 };
    }

    const deNormalizedData = data.map((d) => this.denormalizePayload(d));
    return { data: deNormalizedData, count };
  }

  async getSighting(id: string): Promise<AggregatedSighting> {
    if (!this.supabaseClient) {
      throw new Error("Undefined supabase client");
    }

    return Promise.resolve({
      photos: [
        "https://tdrhuucwalyoftbzwojm.supabase.co/storage/v1/object/public/pet_photos/ai_sightings/87594fc70db086ce9c8b88a658d8e7ee6681351f37aa2062b4a3f634eafc7ac8.jpeg",
      ],
      name: "Louis",
      species: "Dog",
      lastSeenTime: "2026-10-19T16:00:58.489Z",
      lastSeenLat: 37.3286521167393,
      lastSeenLong: -122.022899799049,
      breed: "German Shepherd mix",
      gender: "Male",
      age: 3,
      colors: "black, tan, black and tan points",
      collarDescription: "black collar,silver buckle,black leash attached",
      lastSeenLocation: "10390 N Blaney Ave, Cupertino, CA",
      features:
        "medium-length fur, fluffy curled tail with lighter tip and underside, tan markings on legs and paws, small white patch on left hip",
      updatedAt: "2026-10-19 04:58:52.077+00",
      ownerId: "e866fe24-0f5a-4045-a8d8-c61bdedc4be2",
      linkedSightingId: "02e383fb-5e54-4129-be7d-8f7bf6f4cefd",
      id: "02e383fb-5e54-4129-be7d-8f7bf6f4cefd",
      petId: "b7f449ab-bc2a-4f23-91ad-8f309bcbdd16",
      createdAt: "2026-10-18 05:02:28.797588+00",
      note: "",
      photo: "",
      isActive: true,
      reporterId: "",
      reporterName: "Emma",
      reporterPhone: "2039194426",
      size: "large",
      petDescriptionId: "",
      linkedSightings: [],
    });

    const { data, error } = await this.supabaseClient
      .from("aggregated_sightings")
      .select("*")
      .eq("is_active", true)
      .eq("id", id);

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      throw new Error("No sightings found.");
    }

    return this.denormalizePayload(data[0]);
  }

  async getSightingByLinkedSightingId(
    linkedSightingId: string,
  ): Promise<AggregatedSighting> {
    if (!this.supabaseClient) {
      throw new Error("Undefined supabase client");
    }

    const { data, error } = await this.supabaseClient
      .from("aggregated_sightings")
      .select("*")
      .eq("is_active", true)
      .eq("linked_sighting_id", linkedSightingId);

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      throw new Error("No sightings found.");
    }

    return this.denormalizePayload(data[0]);
  }

  async updateSighting(
    id: string,
    payload: Partial<AggregatedSighting>,
  ): Promise<void> {
    if (!this.supabaseClient) {
      throw new Error("Undefined supabase client");
    }

    const normalizedPayload = this.normalizePayload(payload);

    const { error } = await this.supabaseClient
      .from("aggregated_sightings")
      .update(normalizedPayload)
      .eq("id", id);

    if (error) {
      throw error;
    }
  }

  async updateSightingStatusByPet(id: string): Promise<void> {
    if (!this.supabaseClient) {
      throw new Error("Undefined supabase client");
    }

    const { error } = await this.supabaseClient
      .from("aggregated_sightings")
      .update({
        is_active: false,
      })
      .eq("pet_id", id);

    if (error) {
      throw error;
    }
  }

  async getLinkedSightings(
    linkedSightingId: string,
  ): Promise<AggregatedSighting[]> {
    if (!this.supabaseClient) {
      throw new Error("Undefined supabase client");
    }

    return Promise.resolve([{
      photos: [
        "https://tdrhuucwalyoftbzwojm.supabase.co/storage/v1/object/public/pet_photos/ai_sightings/87594fc70db086ce9c8b88a658d8e7ee6681351f37aa2062b4a3f634eafc7ac8.jpeg",
      ],
      name: "Louis",
      species: "Dog",
      lastSeenTime: "2026-10-19T16:30:58.489Z",
      lastSeenLat: 37.3286521167393,
      lastSeenLong: -122.022899799049,
      breed: "German Shepherd mix",
      gender: "Male",
      age: 3,
      colors: "black, tan, black and tan points",
      collarDescription: "black collar,silver buckle,black leash attached",
      lastSeenLocation: "10390 N Blaney Ave, Cupertino, CA",
      features:
        "medium-length fur, fluffy curled tail with lighter tip and underside, tan markings on legs and paws, small white patch on left hip",
      updatedAt: "2026-10-19 04:58:52.077+00",
      ownerId: "e866fe24-0f5a-4045-a8d8-c61bdedc4be2",
      linkedSightingId: "02e383fb-5e54-4129-be7d-8f7bf6f4cefd",
      id: "02e383fb-5e54-4129-be7d-8f7bf6f4cefd",
      petId: "b7f449ab-bc2a-4f23-91ad-8f309bcbdd16",
      createdAt: "2026-10-18 05:02:28.797588+00",
      note: "Sweet dog",
      photo: "",
      isActive: true,
      reporterId: "",
      reporterName: "Ando",
      reporterPhone: "2039194426",
      size: "large",
      petDescriptionId: "",
      linkedSightings: []
    }, {
      photos: [
        "https://tdrhuucwalyoftbzwojm.supabase.co/storage/v1/object/public/pet_photos/ai_sightings/87594fc70db086ce9c8b88a658d8e7ee6681351f37aa2062b4a3f634eafc7ac8.jpeg",
      ],
      name: "Louis",
      species: "Dog",
      lastSeenTime: "2026-10-19T16:00:58.489Z",
      lastSeenLat: 37.3051496411616,
      lastSeenLong: -122.022899799049,
      breed: "German Shepherd mix",
      gender: "Male",
      age: 3,
      colors: "black, tan, black and tan points",
      collarDescription: "black collar,silver buckle,black leash attached",
      lastSeenLocation: "10390 N Blaney Ave, Cupertino, CA",
      features:
        "medium-length fur, fluffy curled tail with lighter tip and underside, tan markings on legs and paws, small white patch on left hip",
      updatedAt: "2026-10-19 04:58:52.077+00",
      ownerId: "e866fe24-0f5a-4045-a8d8-c61bdedc4be2",
      linkedSightingId: "02e383fb-5e54-4129-be7d-8f7bf6f4cefd",
      id: "02e383fb-5e54-4129-be7d-8f7bf6f4cexc",
      petId: "b7f449ab-bc2a-4f23-91ad-8f309bcbdd16",
      createdAt: "2026-10-18 05:02:28.797588+00",
      note: "",
      photo: "",
      isActive: true,
      reporterId: "",
      reporterName: "Ando",
      reporterPhone: "2039194426",
      size: "large",
      petDescriptionId: "",
      linkedSightings: []
    }, {
      photos: [
        "https://tdrhuucwalyoftbzwojm.supabase.co/storage/v1/object/public/pet_photos/ai_sightings/87594fc70db086ce9c8b88a658d8e7ee6681351f37aa2062b4a3f634eafc7ac8.jpeg",
      ],
      name: "Louis",
      species: "Dog",
      lastSeenTime: "2026-10-19T16:00:58.489Z",
      lastSeenLat: 37.3286521167393,
      lastSeenLong: -122.053175568581,
      breed: "German Shepherd mix",
      gender: "Male",
      age: 3,
      colors: "black, tan, black and tan points",
      collarDescription: "black collar,silver buckle,black leash attached",
      lastSeenLocation: "10390 N Blaney Ave, Cupertino, CA",
      features:
        "medium-length fur, fluffy curled tail with lighter tip and underside, tan markings on legs and paws, small white patch on left hip",
      updatedAt: "2026-10-19 04:58:52.077+00",
      ownerId: "e866fe24-0f5a-4045-a8d8-c61bdedc4be2",
      linkedSightingId: "02e383fb-5e54-4129-be7d-8f7bf6f4cefd",
      id: "02e383fb-5e54-4129-be7d-8f7bf6f4cesd",
      petId: "b7f449ab-bc2a-4f23-91ad-8f309bcbdd16",
      createdAt: "2026-10-18 05:02:28.797588+00",
      note: "Sweet dog",
      photo: "",
      isActive: true,
      reporterId: "",
      reporterName: "Miray",
      reporterPhone: "2039194426",
      size: "large",
      petDescriptionId: "",
      linkedSightings: []
    }]);

    const { data, error } = await this.supabaseClient
      .from("sightings")
      .select("*")
      .eq("is_active", true)
      .or(
        `linked_sighting_id.eq.${linkedSightingId}, id.eq.${linkedSightingId}`,
      )
      .order("last_seen_time", { ascending: false });

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((d) => this.denormalizePayload(d));
  }

  async createSighting(payload: Partial<Sighting>): Promise<string> {
    if (!this.supabaseClient) {
      throw new Error("Undefined supabase client");
    }

    const normalizedPayload = this.normalizePayload(payload);

    const { data, error } = await this.supabaseClient
      .from("sightings")
      .insert(normalizedPayload)
      .select("id")
      .single();
    if (error) {
      throw error;
    }

    if (!data || !data["id"]) {
      throw new Error("No data returned");
    }

    return data["id"];
  }

  async getSightingsByReporter(
    reporterId: string,
  ): Promise<AggregatedSighting[]> {
    if (!this.supabaseClient) {
      throw new Error("Undefined supabase client");
    }

    const { data, error } = await this.supabaseClient
      .from("sightings")
      .select("*")
      .eq("reporter_id", reporterId)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((d) => this.denormalizePayload(d));
  }

  async getSightingsByPetId(petId: string): Promise<AggregatedSighting[]> {
    if (!this.supabaseClient) {
      throw new Error("Undefined supabase client");
    }

    const { data, error } = await this.supabaseClient
      .from("aggregated_sightings")
      .select("*")
      .eq("is_active", true)
      .eq("pet_id", petId)
      .order("updated_at", { ascending: false });

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((d) => this.denormalizePayload(d));
  }

  async getMatchingSightings(
    id: string,
    petDescriptionId: string,
  ): Promise<AggregatedSighting[]> {
    if (!this.supabaseClient) {
      throw new Error("Undefined supabase client");
    }

    const { data, error } = await this.supabaseClient.functions.invoke(
      "get_pet_matches",
      {
        body: {
          sightingId: id,
          petDescriptionId: petDescriptionId,
        },
      },
    );

    if (error) {
      throw error;
    }

    const { data: result } = data;

    if (!result || result.length === 0) {
      return [];
    }

    return result.map((d) => this.denormalizePayload(d));
  }

  async findMatchingSightings(
    sightingId: string,
    userLocationLat: number,
    userLocationLong: number,
    sightingRadiusKm: number,
  ): Promise<void> {
    if (!this.supabaseClient) {
      throw new Error("Undefined supabase client");
    }

    const { error, data } = await this.supabaseClient.functions.invoke(
      "process_pet_matching",
      {
        body: {
          sightingId,
          userLocationLat,
          userLocationLong,
          sightingRadiusKm,
        },
      },
    );

    if (error) {
      throw error;
    }
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
      petDescriptionId: "pet_description_id",
      similarityScore: "similarity_score",
      photos: "photos",
    };

    const normalizedPayload = {};

    Object.keys(payload).map((key) => {
      const dbKey = key in dbKeys && dbKeys[key as keyOfPet];
      if (!dbKey) {
        log(`No db key found for ${key}`);
        return;
      }
      normalizedPayload[dbKey] = payload[key as keyOfPet];
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
      petDescriptionId: "pet_description_id",
      similarityScore: "similarity_score",
      photos: "photos",
    };

    const deNormalizedPayload = {} as AggregatedSighting;

    Object.keys(dbKeys).map((key) => {
      const dbKey = dbKeys[key as keyOfPet];
      if (!dbKey) {
        log(`No db key found for ${key}`);
        return;
      }
      const dbValue = dbKey in payload && payload[dbKey as keyOfPet];
      if (dbValue !== undefined) {
        deNormalizedPayload[key] = dbValue;
      }
    });

    return deNormalizedPayload;
  }
}
