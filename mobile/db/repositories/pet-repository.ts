import { supabase } from "@/components/supabase-client";
import { Pet } from "../models/pet";
import { SupabasePetRepository } from "./supabase/pet-repository";
import { IPetRepository } from "./base-pet-repository";

export class PetRepository implements IPetRepository {
  deletePet(id: string, ownerId: string): Promise<void> {
    const petRepository = new SupabasePetRepository(supabase);
    return petRepository.deletePet(id, ownerId);
  }
  getPet(id: string): Promise<Pet | undefined> {
    const petRepository = new SupabasePetRepository(supabase);
    return petRepository.getPet(id);
  }
  createPet(data: Partial<Pet>): Promise<string> {
    const petRepository = new SupabasePetRepository(supabase);
    return petRepository.createPet(data);
  }
  updatePet(id: string, data: Partial<Pet>): Promise<void> {
    const petRepository = new SupabasePetRepository(supabase);
    return petRepository.updatePet(id, data);
  }
  getPets(ownerId: string): Promise<Pet[]> {
    const petRepository = new SupabasePetRepository(supabase);
    return petRepository.getPets(ownerId);
  }
}
