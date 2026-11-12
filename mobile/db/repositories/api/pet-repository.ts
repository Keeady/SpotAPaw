import { Pet } from "@/db/models/pet";
import { BasePetRepository } from "../base-pet-repository";
import { ApiClient } from "./client";

export class ApiPetRepository extends BasePetRepository {
  apiClient: ApiClient;
  constructor(apiClient: ApiClient) {
    super();
    this.apiClient = apiClient;
  }

  async getPets(ownerId: string): Promise<Pet[]> {
    if (!this.apiClient) {
      throw new Error("Undefined api client");
    }

    return this.apiClient.get<Pet[]>(`/pets/my`);
  }

  async getPet(id: string): Promise<Pet | undefined> {
    if (!this.apiClient) {
      throw new Error("Undefined api client");
    }

    return this.apiClient.get<Pet>(`/pets/my/${id}`);
  }

  async createPet(payload: Partial<Pet>): Promise<string> {
    if (!this.apiClient) {
      throw new Error("Undefined api client");
    }

    const changes = {
      name: payload.name,
      age: payload.age,
      species: payload.species,
      breed: payload.breed,
      behavior: payload.behavior,
      size: payload.size,
      gender: payload.gender,
      isLost: Boolean(payload.isLost),
      features: payload.features,
      note: payload.note,
      colors: payload.colors,
      collarDescription: payload.collarDescription,
      photos: payload.photos || [],
      petDescriptionId: payload.petDescriptionId      
    };

    return this.apiClient.post<Pet>(`/pets/my`, changes);
  }

  async updatePet(id: string, payload: Partial<Pet>): Promise<void> {
    if (!this.apiClient) {
      throw new Error("Undefined api client");
    }

    const changes = {
      name: payload.name,
      age: payload.age,
      species: payload.species,
      breed: payload.breed,
      behavior: payload.behavior,
      size: payload.size,
      gender: payload.gender,
      isLost: payload.isLost,
      features: payload.features,
      note: payload.note,
      colors: payload.colors,
      collarDescription: payload.collarDescription,
    } as Partial<Pet>;

    if (payload.photos && payload.photos.length > 0) {
      changes.photos = payload.photos;
    }

    if (payload.petDescriptionId) {
      changes.petDescriptionId = payload.petDescriptionId;
    }

    return this.apiClient.patch(`/pets/my/${id}`, changes);
  }

    async deletePet(id: string, ownerId: string): Promise<void> {
    if (!this.apiClient) {
      throw new Error("Undefined api client");
    }

    return this.apiClient.delete(`/pets/my/${id}`);
  }
}
