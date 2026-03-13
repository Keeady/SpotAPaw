import { Pet } from "../models/pet";

export interface PetRepository {
  getPet(id: string): Promise<Pet>;
  createPet(data: Pet): Promise<string>;
  updatePet(data: Pet): Promise<void>
  getPets(ownerId: string): Promise<Pet[]>;
}

export class BasePetRepository implements PetRepository {
    getPet(id: string): Promise<Pet> {
        throw new Error("Method not implemented.");
    }
    createPet(data: Pet): Promise<string> {
        throw new Error("Method not implemented.");
    }
    updatePet(data: Pet): Promise<void> {
        throw new Error("Method not implemented.");
    }
    getPets(ownerId: string): Promise<Pet[]> {
        throw new Error("Method not implemented.");
    }
    
}