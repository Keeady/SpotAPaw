import { Pet } from "../models/pet";

export interface PetRepository {
  getPet(id: string): Promise<Pet>;
  createPet(data: Pet): Promise<string>;
  updatePet(id: string, data: Pet): Promise<void>
  getPets(ownerId: string): Promise<Pet[]>;
  deletePet(id: string, ownerId: string): Promise<void>;
}

export class BasePetRepository implements PetRepository {
    deletePet(_id: string, _ownerId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    getPet(_id: string): Promise<Pet> {
        throw new Error("Method not implemented.");
    }
    createPet(_data: Pet): Promise<string> {
        throw new Error("Method not implemented.");
    }
    updatePet(_id: string, _data: Pet): Promise<void> {
        throw new Error("Method not implemented.");
    }
    getPets(_ownerId: string): Promise<Pet[]> {
        throw new Error("Method not implemented.");
    }
    
}