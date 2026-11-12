import { Pet } from "../models/pet";
import { IPetRepository } from "./base-pet-repository";
import { authenticatedApiClient } from "./api/client";
import { ApiPetRepository } from "./api/pet-repository";
import AppConstants from "@/components/constants";

export class PetRepository implements IPetRepository {
  deletePet(id: string, ownerId: string): Promise<void> {
    const petRepository = new ApiPetRepository(authenticatedApiClient);
    return petRepository.deletePet(id, ownerId);
  }
  getPet(id: string): Promise<Pet | undefined> {
    const petRepository = new ApiPetRepository(authenticatedApiClient);
    return petRepository.getPet(id);
  }
  createPet(data: Partial<Pet>): Promise<string> {
    const petRepository = new ApiPetRepository(authenticatedApiClient);
    return petRepository.createPet(data);
  }
  updatePet(id: string, data: Partial<Pet>): Promise<void> {
    const petRepository = new ApiPetRepository(authenticatedApiClient);
    return petRepository.updatePet(id, data);
  }
  getPets(ownerId: string): Promise<Pet[]> {
    const petRepository = new ApiPetRepository(authenticatedApiClient);
    return petRepository.getPets(ownerId);
  }
}
